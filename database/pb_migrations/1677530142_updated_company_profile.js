migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("mszvdl5q9vxw53x")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lihxiwz6",
    "name": "company_people",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": [
        "email"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("mszvdl5q9vxw53x")

  // remove
  collection.schema.removeField("lihxiwz6")

  return dao.saveCollection(collection)
})
