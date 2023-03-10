migrate((db) => {
  const collection = new Collection({
    "id": "mszvdl5q9vxw53x",
    "created": "2023-02-27 20:12:12.196Z",
    "updated": "2023-02-27 20:12:12.196Z",
    "name": "company_profile",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "seuniumq",
        "name": "company_name",
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
        "id": "x8q9ccdo",
        "name": "company_website",
        "type": "url",
        "required": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "oeomv9ik",
        "name": "company_size",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "1",
            "2-5",
            "5-10",
            "10-25",
            "26-100",
            "100-500",
            "500+"
          ]
        }
      },
      {
        "system": false,
        "id": "osvpsacv",
        "name": "company_offerings",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 2,
          "values": [
            "services",
            "products"
          ]
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("mszvdl5q9vxw53x");

  return dao.deleteCollection(collection);
})
