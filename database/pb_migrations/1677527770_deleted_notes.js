migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("07l603vwmqebbtd");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "07l603vwmqebbtd",
    "created": "2023-02-27 09:02:08.983Z",
    "updated": "2023-02-27 09:02:08.983Z",
    "name": "notes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "nznij4f5",
        "name": "title",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "p2kai3jt",
        "name": "body",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
