const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Set up static files
app.use(express.static(path.join(__dirname, "public")));

// Set up handlebars as the view engine
app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        helpers: {
            noReviews: function (reviews) {
                return reviews !== "" ? reviews : "N/A";
            },
        },
    })
);
app.set("view engine", ".hbs");

// Body parser middleware

// Load JSON data
const jsonDataPath = path.join(__dirname, "data.json");
let jsonData = null;
try {
    jsonData = JSON.parse(fs.readFileSync(jsonDataPath, "utf8"));
} catch (err) {
    console.error("Error loading JSON file:", err);
}

// Routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

app.get("/data", (req, res) => {
    res.render("data", { title: "Data", jsonData: jsonData });
});

app.get("/data/product/:index", (req, res) => {
    const index = req.params.index;
    if (index >= 0 && index < jsonData.length) {
        const productID = jsonData[index].asin;
        res.render("product", { title: "Product", productID });
    } else {
        res.status(404).send("Product not found");
    }
});

app.get("/data/search/prdID", (req, res) => {
    res.render("search_prdID", { title: "Search by Product ID" });
});

// Route to handle search for product by ID
app.post("/data/search/prdID", (req, res) => {
    const productID = req.body.productID;

    // Search for the matching product object manually
    let matchingProduct = null;
    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].asin === productID) {
            matchingProduct = jsonData[i];
            break;
        }
    }

    // If matching product is found, send it as response
    if (matchingProduct) {
        res.send(matchingProduct);
    } else {
        res.status(404).send("Product not found");
    }
});

app.get("/data/search/prdName", (req, res) => {
    res.render("search_prdName", { title: "Search by Product Name" });
});

app.post("/data/search/prdName", (req, res) => {
    const productTitle = req.body.productName;

    const product = jsonData.filter((item) =>
        item.title.includes(productTitle)
    );
    if (product) {
        res.render("search_result", { title: "Search Result", product });
    } else {
        res.status(404).send("Product not found");
    }
});

app.get("/allData", (req, res) => {
    res.render("allData", {
        title: "All Products",
        products: jsonData,
    });
});

// Catch all route for undefined routes
app.get("*", (req, res) => {
    res.render("error", { title: "Error", message: "Wrong Route" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
