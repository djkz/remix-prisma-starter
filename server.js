const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const session = require("express-session");
const { createRequestHandler } = require("@remix-run/express");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

let app = express();

// Responses should be served with compression to minimize total network bytes.
// However, where this compression happens can vary wildly depending on your stack
// and infrastructure. Here we are compressing all our Express responses for the
// purpose of this starter repository, but feel free to (re)move it or change it.
app.use(compression());

app.use(express.static("public"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

var transport = nodemailer.createTransport({
  host: process.env.MAIL_SERVER,
  port: 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const prisma = new PrismaClient();

// Sessions are optional. If you don't want them, just remove this middleware.
// Otherwise, you should configure it with a session store other than the memory
// store so they persist. See https://www.npmjs.com/package/express-session
var sess = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {},
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

app.all(
  "*",
  createRequestHandler({
    getLoadContext(req) {
      // Whatever you return here will be passed as `context` to your loaders
      // and actions.

      return { prisma, transport, session: createSession(req) };
    },
  })
);

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server started on http://localhost:${port}`);
});

// session util
function createSession(req) {
  return {
    flash(key, message) {
      if (!req.session.flash) req.session.flash = {};
      req.session.flash[key] = message;
    },

    get(key) {
      const flash = req.session.flash && req.session.flash[key];
      if (flash) {
        req.session.flash[key] = null;
        return flash;
      }
      return req.session[key];
    },

    set(key, message) {
      req.session[key] = message;
    },
  };
}
