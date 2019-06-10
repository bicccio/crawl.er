import Datastore from "nedb-promises";

export default () => {
  let db;

  const init = async () => {
    // init and load db
    db = Datastore.create({ filename: "./db" });
    db.persistence.setAutocompactionInterval(10000);
    await db.load();
  };

  const insert = (url, title, visited) => {
    db.insert({
      url: url,
      title: title,
      visited: visited
    });
  };

  const update = async (url, title, visited) => {
    await db.update({ url }, { url, title, visited }, {});
  };

  const findByUrl = async url => {
    return await db.findOne({ url });
  };

  const findNotVisited = async () => {
    return await db.findOne({ visited: false });
  };

  return { insert, findByUrl, findNotVisited, init, update };
};
