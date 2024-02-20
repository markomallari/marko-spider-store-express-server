const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp/uploads/images/");
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    fs.readFile("db.json", "utf8", (err, data) => {
      const jsonData = JSON.parse(data);

      const maxId = jsonData.spiders.reduce(
        (max, item) => Math.max(max, item.id),
        0
      );
      cb(null, `${maxId + 1}.${extension}`);
    });
  },
});

const upload = multer({ storage: storage });

const app = express();
const port = 3000;

app.use(express.static("tmp/uploads/images"));

// Cors configuration - Allows requests from localhost:4200
const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
};

// Use cors middleware
app.use(cors(corsOptions));

// Use express.json() middleware to parse JSON bodies of requests
app.use(express.json());

// GET route - Allows to get all the items
// example: localhost:3000/clothes?page=0&perPage=2
app.get("/products", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const start = page * perPage;
    const end = start + perPage;

    const result = jsonData.spiders.slice(start, end);

    res.status(200).json({
      data: result,
      total: jsonData.spiders.length,
      page,
      perPage,
      totalPages: Math.ceil(jsonData.spiders.length / perPage),
    });
  });
});

app.post("/products", (req, res) => {
  const {
    image,
    name,
    price,
    rating,
    classification,
    scientific_name,
    family,
    description,
  } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const maxId = jsonData.spiders.reduce(
      (max, item) => Math.max(max, item.id),
      0
    );

    const newItem = {
      id: maxId + 1,
      image,
      name,
      price,
      rating,
      classification,
      scientific_name,
      family,
      description,
    };

    jsonData.spiders.push(newItem);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(201).json(newItem);
    });
  });
});

app.post("/products/upload", upload.single("file"), (req, res) => {
  let requestItem = req.file;
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      const obj = {
        req: requestItem,
      };
      res.status(201).json(obj);
    });
  });
});

app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {
    image,
    name,
    price,
    rating,
    classification,
    scientific_name,
    family,
    description,
  } = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const index = jsonData.spiders.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }

    jsonData.spiders[index] = {
      id,
      image,
      name,
      price,
      rating,
      classification,
      scientific_name,
      family,
      description,
    };

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(200).json(jsonData.spiders[index]);
    });
  });
});

app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const index = jsonData.spiders.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }

    jsonData.spiders.splice(index, 1);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(204).send();
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
