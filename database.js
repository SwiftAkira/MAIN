const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydatabase.db');

const initializeSlots = () => {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS slots (time TEXT, availableSpaces INTEGER)");

    const slots = [
      { time: '8:30 am', availableSpaces: 20 },
      { time: '9:00 am', availableSpaces: 20 },
      { time: '9:30 am', availableSpaces: 20 },
      { time: '10:00 am', availableSpaces: 20 },
      { time: '10:30 am', availableSpaces: 20 },
      { time: '11:00 am', availableSpaces: 20 },
      { time: '11:30 am', availableSpaces: 20 },
      { time: '12:00 pm', availableSpaces: 20 },
      { time: '12:30 pm', availableSpaces: 20 },
      { time: '1:00 pm', availableSpaces: 20 },
      { time: '1:30 pm', availableSpaces: 20 },
      { time: '2:00 pm', availableSpaces: 20 },
      { time: '2:30 pm', availableSpaces: 20 },
      { time: '3:00 pm', availableSpaces: 20 },
      { time: '3:30 pm', availableSpaces: 20 },
      { time: '4:00 pm', availableSpaces: 20 },
      { time: '4:30 pm', availableSpaces: 20 },
      { time: '5:00 pm', availableSpaces: 20 },
    ];

    const stmt = db.prepare("INSERT INTO slots (time, availableSpaces) VALUES (?, ?)");
    slots.forEach(slot => {
      stmt.run(slot.time, slot.availableSpaces);
    });
    stmt.finalize();
  });
};

const resetDatabase = () => {
  db.serialize(() => {
    db.run("DELETE FROM slots");
    db.run("DELETE FROM json_data");
    initializeSlots();
  });
};

const getAllSlots = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM slots", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const updateSlotAvailability = (time, availableSpaces) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE slots SET availableSpaces = ? WHERE time = ?", [availableSpaces, time], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

const insertJsonData = (jsonData) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO json_data (data) VALUES (?)", JSON.stringify(jsonData), function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

const getAllJsonData = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT rowid AS id, data FROM json_data", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({ id: row.id, data: JSON.parse(row.data) })));
      }
    });
  });
};

const deleteJsonData = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT data FROM json_data WHERE rowid = ?", id, (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        const bookingData = JSON.parse(row.data);
        const timeSlot = bookingData.timeSlot;
        const groupSize = bookingData.groupSize;

        db.run("DELETE FROM json_data WHERE rowid = ?", id, function(err) {
          if (err) {
            reject(err);
          } else {
            // Update the slot availability
            db.run("UPDATE slots SET availableSpaces = availableSpaces + ? WHERE time = ?", [groupSize, timeSlot], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.changes);
              }
            });
          }
        });
      } else {
        resolve(0); // No booking found with the given id
      }
    });
  });
};

module.exports = {
  db,
  initializeSlots,
  resetDatabase,
  getAllSlots,
  updateSlotAvailability,
  insertJsonData,
  getAllJsonData,
  deleteJsonData
};
