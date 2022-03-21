const JSZip = require("jszip");
const fs = require("fs");

const express = require("express");

const app = express();
const multer = require("multer");
const upload = multer({ dest: "/tmp" });

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.post(
  "/api/v1/convert",
  upload.single("anislide"),
  function (req, res, next) {
    const file = req.file;
    const fileName = file.originalname;
    const path = file.path;
    const type = file.mimetype;
    fs.readFile(path, function (err, data) {
      if (err) {
        return res.status(403).send(err.message);
      }

      JSZip.loadAsync(data).then(
        function (zip) {
          var fileNames = [];
          var html = `
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8" />
	<title>AniSlides | Exported File</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
	<!-- Link Reveal CSS -->
	
		<link rel="stylesheet" href="https://unpkg.com/reveal.js/dist/reset.css">
		<link rel="stylesheet" href="https://unpkg.com/reveal.js/dist/reveal.css">
		<link rel="stylesheet" href="https://anislides-compiler.techwithanirudh.repl.co/theme/theme.css" id="theme">

		<!-- Theme used for syntax highlighting of code -->
		<link rel="stylesheet" href="https://unpkg.com/reveal.js/plugin/highlight/monokai.css">

<!-- Reveal styling fix -->
<style>
  .reveal p {
    text-align: left;
  }
  .reveal ul {
    display: block;
  }
  .reveal ol {
    display: block;
  }

.reveal p {
	font-size: initial;
}
</style>

</head>

<body>
	<!-- Reveal JS -->
	<div class="theme-font-montserrat theme-color-white-blue" style="width: 100%; height: 100%;">
    	<div class="reveal">
			<div class="slides">
`;
          zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.name.endsWith(".html")) {
              fileNames.push(zipEntry.name);
            }
          });
          if (fileNames.length <= 0) return res.sendStatus(403);
          fileNames.forEach(async function (filePath, i) {
            const file = await zip.file(filePath);
            if (!file) return;
            var fileName = file.name;
            const fileContent = await file.async("string");
            fileName = fileName.split(".html")[0];
            html += `
			<section>
			  ${fileContent}
			</section>
			`;
            if (i === fileNames.length - 1) {
              html += `
			</div>
		</div>
	</div>

	<!-- Reveal JS -->
		<script src="https://unpkg.com/reveal.js/dist/reveal.js"></script>
		<script src="https://unpkg.com/reveal.js/plugin/zoom/zoom.js"></script>
		<script src="https://unpkg.com/reveal.js/plugin/notes/notes.js"></script>
		<script src="https://unpkg.com/reveal.js/plugin/search/search.js"></script>
		<script src="https://unpkg.com/reveal.js/plugin/markdown/markdown.js"></script>
		<script src="https://unpkg.com/reveal.js/plugin/highlight/highlight.js"></script>
<script src="https://denehyg.github.io/reveal.js-menu/plugin/reveal.js-menu/menu.js">
</script>

	<!-- Initialize Reveal -->
	<script>

			// Also available as an ES module, see:
			// https://revealjs.com/initialization/
			Reveal.initialize({
				controls: true,
				progress: true,
				center: false,
				hash: true,
				history: true,
				margin: 0,
				minScale: 1,
				maxScale: 1,
                disableLayout: true,
                touch: true,
				slideNumber: true,
				transition: "slide",
				backgroundTransition: "slide",

        menu: {
          numbers: 'c',
          openSlideNumber: true,
          themes: true,
          themesPath: 'https://denehyg.github.io/reveal.js-menu/lib/reveal.js/dist/theme/',
          transitions: true
        },

				// Learn about plugins: https://revealjs.com/plugins/
				plugins: [ RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight, RevealMenu ]
			});
	</script>
</body>

</html>
		`;
              return res.send(html);
            }
          });
        },
        function (err) {
          return res.status(500).send(err.message);
        }
      );
    });
  }
);


app.post(
  "/api/v1/html",
  upload.single("anislide"),
  function (req, res, next) {
    const file = req.file;
    const fileName = file.originalname;
    const path = file.path;
    const type = file.mimetype;
    fs.readFile(path, function (err, data) {
      if (err) {
        return res.status(403).send(err.message);
      }

      JSZip.loadAsync(data).then(
        function (zip) {
          var fileNames = [];
	  var html = []
          zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.name.endsWith(".html") && zipEntry.name !== 'index.html') {
              fileNames.push(zipEntry.name);
            }
          });
          if (fileNames.length <= 0) return res.sendStatus(403);
          fileNames.forEach(async function (filePath, i) {
            const file = await zip.file(filePath);
            if (!file) return;
            var fileName = file.name;
            const fileContent = await file.async("string");
            fileName = fileName.split(".html")[0];
            html.push({id: fileName, content: fileContent})
            if (i === fileNames.length - 1) {
              return res.send(html);
            }
          });
        },
        function (err) {
          return res.status(403).send(err.message);
        }
      );
    });
  }
);

app.listen(3000, () => {
  console.log("server started");
});
