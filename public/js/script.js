document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");
  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });
  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
    }
  });
  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });
  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });
  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
    dropZoneElement.classList.remove("drop-zone--over");
  });
});

async function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }
  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }
  thumbnailElement.dataset.label = file.name;

  function openDialog(html) {
    var params = [
      "height=" + screen.height,
      "width=" + screen.width,
      "fullscreen=yes", // only works in IE, but here for completeness
    ].join(",");
    // and any other options from
    // https://developer.mozilla.org/en/DOM/window.open
    let tab = window.open("", "popup_window", params);
    tab.moveTo(0, 0);
    tab.document.write(html);
  }

  let formData = new FormData();
  formData.append("anislide", file);

  var response = await fetch("/api/v1/convert", {
    method: "POST",
    body: formData,
  });

  if (response.status === 200) {
    thumbnailElement.style.backgroundImage = `url('${"https://cdn.iconscout.com/icon/free/png-256/slideshow-4844710-4033380.png"}')`;
    anialert(
      (title = "Success!"),
      (content = "Read the file " + file.name + ". Opening"),
      (type = "success")
    );
    openDialog(await response.text());
  } else {
    thumbnailElement.style.backgroundImage = `url('${"https://cdn.iconscout.com/icon/free/png-256/error-4292681-3557167.png"}')`;
    anialert(
      (title = "Error!"),
      (content = "Error reading " + file.name),
      (type = "error")
    );
  }

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  }
}
