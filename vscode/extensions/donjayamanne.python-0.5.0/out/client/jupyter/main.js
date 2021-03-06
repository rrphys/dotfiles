"use strict";
const kernel_manager_1 = require('./kernel-manager');
const vscode = require('vscode');
const main_1 = require('./display/main');
const kernelStatus_1 = require('./display/kernelStatus');
const constants_1 = require('../common/constants');
const codeLensProvider_1 = require('./editorIntegration/codeLensProvider');
const symbolProvider_1 = require('./editorIntegration/symbolProvider');
const utils_1 = require('../common/utils');
const constants_2 = require('../common/constants');
const telemetryHelper = require('../common/telemetry');
const telemetryContracts = require('../common/telemetryContracts');
const main = require('./jupyter_client/main');
const errors_1 = require('./common/errors');
// Todo: Refactor the error handling and displaying of messages
class Jupyter extends vscode.Disposable {
    constructor(outputChannel) {
        super(() => { });
        this.outputChannel = outputChannel;
        this.kernel = null;
        this.disposables = [];
        this.registerCommands();
        this.registerKernelCommands();
    }
    activate(rootPath) {
        const jupyterClient = new main.JupyterClientAdapter(this.outputChannel, rootPath);
        this.kernelManager = new kernel_manager_1.KernelManagerImpl(this.outputChannel, jupyterClient);
        this.disposables.push(this.kernelManager);
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(this.onEditorChanged.bind(this)));
        this.codeLensProvider = new codeLensProvider_1.JupyterCodeLensProvider();
        this.disposables.push(vscode.languages.registerCodeLensProvider(constants_1.PythonLanguage, this.codeLensProvider));
        this.disposables.push(vscode.languages.registerDocumentSymbolProvider(constants_1.PythonLanguage, new symbolProvider_1.JupyterSymbolProvider()));
        this.status = new kernelStatus_1.KernelStatus();
        this.disposables.push(this.status);
        this.display = new main_1.JupyterDisplay(this.codeLensProvider);
        this.disposables.push(this.display);
        // This happend when user changes it from status bar
        this.kernelManager.on('kernelChanged', (kernel, language) => {
            if (this.kernel !== kernel && (this.kernel && this.kernel.kernelSpec.language === kernel.kernelSpec.language)) {
                this.onKernelChanged(kernel);
            }
        });
    }
    hasCodeCells(document, token) {
        return new Promise(resolve => {
            this.codeLensProvider.provideCodeLenses(document, token).then(codeLenses => {
                resolve(Array.isArray(codeLenses) && codeLenses.length > 0);
            }, reason => {
                console.error('Failed to detect code cells in document');
                console.error(reason);
                resolve(false);
            });
        });
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    onEditorChanged(editor) {
        if (!editor || !editor.document) {
            return;
        }
        const kernel = this.kernelManager.getRunningKernelFor(editor.document.languageId);
        if (this.kernel !== kernel) {
            return this.onKernelChanged(kernel);
        }
    }
    onKernelChanged(kernel) {
        if (this.onKernalStatusChangeHandler) {
            this.onKernalStatusChangeHandler.dispose();
            this.onKernalStatusChangeHandler = null;
        }
        if (kernel) {
            this.onKernalStatusChangeHandler = kernel.onStatusChange(statusInfo => {
                this.status.setKernelStatus(statusInfo[1]);
            });
        }
        this.kernel = kernel;
        this.status.setActiveKernel(this.kernel ? this.kernel.kernelSpec : null);
    }
    executeCode(code, language) {
        // const m = new main.JupyterClient(this.outputChannel);
        // m.start();
        // return Promise.resolve();
        telemetryHelper.sendTelemetryEvent(telemetryContracts.Jupyter.Usage);
        if (this.kernel && this.kernel.kernelSpec.language === language) {
            return this.executeAndDisplay(this.kernel, code).catch(reason => {
                const message = typeof reason === 'string' ? reason : reason.message;
                vscode.window.showErrorMessage(message);
                this.outputChannel.appendLine(utils_1.formatErrorForLogging(reason));
            });
        }
        return this.kernelManager.startKernelFor(language)
            .then(kernel => {
            if (kernel) {
                this.onKernelChanged(kernel);
                return this.executeAndDisplay(kernel, code);
            }
        }).catch(reason => {
            const message = typeof reason === 'string' ? reason : reason.message;
            this.outputChannel.appendLine(utils_1.formatErrorForLogging(reason));
            vscode.window.showErrorMessage(message, 'Help', 'View Errors').then(item => {
                if (item === 'Help') {
                    vscode.commands.executeCommand('python.displayHelp', constants_2.Documentation.Jupyter.Setup);
                }
                if (item === 'View Errors') {
                    this.outputChannel.show();
                }
            });
        });
    }
    executeAndDisplay(kernel, code) {
        return this.executeCodeInKernel(kernel, code).then(result => {
            // No results to display
            if (result.length === 0) {
                return;
            }
            return this.display.showResults(result);
        });
    }
    executeCodeInKernel(kernel, code) {
        return new Promise((resolve, reject) => {
            let responses = [];
            return kernel.execute(code).subscribe(result => {
                if (typeof result.data['text/html'] === 'string') {
                    result.data['text/html'] = result.data['text/html'].replace(/<\/script>/g, '</scripts>');
                }
                responses.push(result.data);
            }, reason => {
                if (reason instanceof errors_1.KernelRestartedError || reason instanceof errors_1.KernelShutdownError) {
                    return resolve([]);
                }
                reject(reason);
            }, () => {
                resolve(responses);
            });
        });
    }
    executeSelection() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || !activeEditor.document) {
            return;
        }
        let code = '';
        if (activeEditor.selection.isEmpty) {
            code = activeEditor.document.lineAt(activeEditor.selection.start.line).text;
        }
        else {
            code = activeEditor.document.getText(activeEditor.selection);
        }
        this.executeCode(code, activeEditor.document.languageId);
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.ExecuteRangeInKernel, (document, range) => {
            if (!document || !range || range.isEmpty) {
                return Promise.resolve();
            }
            const code = document.getText(range);
            return this.executeCode(code, document.languageId);
        }));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.ExecuteSelectionOrLineInKernel, this.executeSelection.bind(this)));
    }
    registerKernelCommands() {
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Kernel.Kernel_Interrupt, () => {
            this.kernel.interrupt();
        }));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Kernel.Kernel_Restart, () => {
            this.kernelManager.restartRunningKernelFor(this.kernel.kernelSpec.language).then(kernel => {
                this.onKernelChanged(kernel);
            });
        }));
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Kernel.Kernel_Shut_Down, () => {
            this.kernelManager.destroyRunningKernelFor('python');
            this.onKernelChanged();
        }));
    }
}
exports.Jupyter = Jupyter;
;
//# sourceMappingURL=main.js.map