const { PORT } = require("./utils/config");

const app = require("./app");
const { info } = require("./utils/logger");

app.listen(PORT, () => info("server running on port 🎉:", PORT));
