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
	<!-- Link Swiper's CSS -->
	<link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />

	<!-- Demo styles -->
	<style>
		html,
		body {
			position: relative;
			height: 100%;
			margin: 0;
			padding: 0;
		}

		.swiper {
			width: 100%;
			height: 100%;
		}

		.swiper-slide {
			text-align: center;
			font-size: 18px;
			background: #fff;

			/* Center slide text vertically */
			display: -webkit-box;
			display: -ms-flexbox;
			display: -webkit-flex;
			display: flex;
			-webkit-box-pack: center;
			-ms-flex-pack: center;
			-webkit-justify-content: center;
			justify-content: center;
			-webkit-box-align: center;
			-ms-flex-align: center;
			-webkit-align-items: center;
			align-items: center;
		}

		.swiper-slide img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.swiper-pagination-bullet {
			width: 20px;
			height: 20px;
			text-align: center;
			line-height: 20px;
			font-size: 12px;
			color: #000;
			opacity: 1;
			background: rgba(0, 0, 0, 0.2);
		}

		.swiper-pagination-bullet-active {
			color: #fff;
			background: #007aff;
		}
	</style>

	<!-- media="print" means these styles will only be used by printing 
  devices -->
	<style type="text/css" media="print">
    	.printable { 
      		page-break-after: always;
    	}
		iframe {
			border: none;
			width: 100%;
			height: 100%;
		}
    	.swiper, .tlbButton {
     		display: none !important;
    	}
	</style>
	<!-- media="screen" means these styles will only be used by screen 
  	devices (e.g. monitors) -->
	<style type="text/css" media="screen">
    	.printable {
      		display: none;
    	}
	</style>
	<style>
.tlbButton {
  border: none;
  color: white;
  padding: 16px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
}

.tlbButton {
  background-color: white; 
  color: black; 
  border: 2px solid #008CBA;
}

.tlbButton {
    z-index: 99;
    position: fixed;
    bottom: 20px;
    right: 30px;
}

.tlbButton:hover {
  background-color: #008CBA;
  color: white;
}
</style>
</head>

<body>
	<!-- Swiper -->
	<div class="swiper mySwiper">
		<div class="swiper-wrapper">
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
			<div class="swiper-slide" data-id="${i + 1}">
			  ${fileContent}
			</div>
			`;
            if (i === fileNames.length - 1) {
              html += `
		</div>
		<div class="swiper-button-next"></div>
		<div class="swiper-button-prev"></div>
		<div class="swiper-pagination"></div>
	</div>

	<!-- Swiper JS -->
	<script src="https://unpkg.com/swiper/swiper-bundle.min.js">

	</script>

    <button class="tlbButton" onclick="window.print()">Print</button>

	<!-- Initialize Swiper -->
	<script>
		var swiper = new Swiper(".mySwiper", {
  effect: 'creative',
  creativeEffect: {
    prev: {
      translate: [0, 0, -400],
    },
    next: {
      translate: ['100%', 0, 0],
    },
  },
        grabCursor: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + "</span>";
          },
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });

	  document.addEventListener('keydown', function(e) {

  e = e || window.event;

  if (e.keyCode == "37") {
    swiper.slidePrev()
  } else if (e.keyCode == "39") {
    swiper.slideNext()
  } else {
    console.log('Key:' + e.key)
    console.log('Key Code:' + e.keyCode)
  }
	  })

	</script>
</body>

</html>
		`;
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
