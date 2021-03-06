'use strict';
const vscode_1 = require('vscode');
const cells_1 = require('../common/cells');
class JupyterSymbolProvider {
    provideDocumentSymbols(document, token) {
        const cells = cells_1.CellHelper.getCells(document);
        if (cells.length === 0) {
            return Promise.resolve([]);
        }
        const symbols = cells.map(cell => {
            const title = 'Jupyter Cell' + (cell.title.length === 0 ? '' : ': ' + cell.title);
            return new vscode_1.SymbolInformation(title, vscode_1.SymbolKind.Namespace, cell.range);
        });
        return Promise.resolve(symbols);
    }
}
exports.JupyterSymbolProvider = JupyterSymbolProvider;
//# sourceMappingURL=symbolProvider.js.map