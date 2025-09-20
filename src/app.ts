import express from "express";
import { logHostname, logRequestMethod, requestLogger } from "./middleware/middleware";
import { adminRoute  } from "./routes/admin/adminRoute";
import { userRoute } from "./routes/users/userRoute";
import { auth } from "./routes/auth/auth";

const app = express();
const port = 7000;

// app.use(cors())

app.use(express.json());
app.use(requestLogger)

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/home", (req, res) => {
  res.status(200).json({ hello: "Hello, World!" });
});

app.get("/about", logHostname, logRequestMethod, (req, res) => {
  console.log("woho..!!!!");
  res.send("all about");
});

console.log("route admin")
app.use("/" , auth)
app.use("/api/v1/admin", adminRoute);

app.use("/api/v1/user" , userRoute)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
