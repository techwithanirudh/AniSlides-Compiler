function anialert(
	title = "Success!",
	content = "Indicates a successful or positive action.",
	type = "success",
	alertGroup = "anialertbox"
) {
	var alertElContent = `
            <span class="closebtn">&times;</span>
            <strong>${title}</strong> ${content}
        `;
	var alertEl = document.createElement("div");
	alertEl.className = `alert ${type}`;
	alertEl.innerHTML = alertElContent;
	var alertGroup = document.getElementById(alertGroup);
	if (!alertGroup.classList.contains('anialertbox')) {
		alertGroup.classList.add('anialertbox')
	}

	alertEl.querySelector('.closebtn').addEventListener('click', function () {
		var div = this.parentElement;
		div.style.opacity = "0";
		setTimeout(function () {
			div.style.display = "none";
		}, 600);
	})

	alertEl.style.opacity = "0";
	setTimeout(function () {
		alertEl.style.opacity = "100";
		alertEl.style.display = "block";
	}, 600);

	alertGroup.appendChild(alertEl);
}
