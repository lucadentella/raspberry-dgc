const Database = require('better-sqlite3');

class SqliteCrlManager {
    async setUp() {
        this._db = new Database('crl.db');
        await this._db.exec("CREATE TABLE IF NOT EXISTS ucvi (revokedUcvi VARCHAR PRIMARY KEY,created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    }

    async storeRevokedUVCI(revokedUvci) {
        const stmt = this._db.prepare('INSERT OR IGNORE INTO ucvi(revokedUcvi) VALUES ' + revokedUvci.map((uvci) => '(?)').join(','));
        await stmt.run(revokedUvci);
    }

    async isUVCIRevoked(uvci) {
        const stmt = this._db.prepare('SELECT revokedUcvi FROM ucvi WHERE revokedUcvi = ?');
        return await stmt.get(uvci);
    }

    async tearDown() {
        return this._db.close();
    }

    async clean() {
        const stmt = this._db.prepare('DELETE FROM ucvi WHERE revokedUcvi <> ?');
        return await stmt.run(1);
    }
}

const crlManager = new SqliteCrlManager();
module.exports = crlManager;