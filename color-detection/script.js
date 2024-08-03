(function () {
	console.log("ready!");
	$(".file-upload-content").hide();

	var dropZone, handleDragOver, handleFileSelect;

	dropZone = document.getElementById("image-upload-wrap");
	handleFileSelect = function (event) {
		var data, f, files, parseFile, progress, reader;
		event.stopPropagation();
		event.preventDefault();
		files = event.dataTransfer.files;
		f = files[0];
		reader = new FileReader();

		progress = function (event) {
			var image, results;
			image = new Image();
			image.src = event.target.result;
			document.getElementById("image").innerHTML =
				"<img src='" + event.target.result + "' />";
			image.onload = function () {
				$(".file-upload-content").show();
				$("#image-upload-wrap").hide();
				var el, el1, swatch, swatches, vibrant, contrasting;
				vibrant = new Vibrant(image, 256, 1);
				swatches = vibrant.swatches();
				results = [];
				for (swatch in swatches) {
					if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
						results.push(
							(function () {
								var i, len, ref, ref1, results1;
								ref = document.querySelectorAll(".color" + swatch);
								ref1 = document.querySelectorAll(".hex" + swatch);
								results1 = [];
								for (i = 0, len = ref.length; i < len; i++) {
									el = ref[i];
									results1.push((el.style.backgroundColor = swatches[swatch].getHex()));
								}
								for (i = 0, len = ref1.length; i < len; i++) {
									el1 = ref1[i];
									results1.push((el1.innerHTML = swatches[swatch].getHex()));
								}
								return results1;
							})()
						);
					} else {
						results.push(void 0);
					}
				}
			};
			return results;
		};
		parseFile = function (theFile) {
			return progress;
		};
		reader.onload = parseFile(f);
		return (data = reader.readAsDataURL(f));
	};

	handleDragOver = function (event) {
		event.stopPropagation();
		event.preventDefault();
		return (event.dataTransfer.dropEffect = "copy");
	};

	dropZone.addEventListener("dragover", handleDragOver, false);
	dropZone.addEventListener("drop", handleFileSelect, false);
}.call(this));

function removeUpload() {
	$(".file-upload-input").replaceWith($(".file-upload-input").clone());
	$(".file-upload-content").hide();
	$("#image-upload-wrap").show();
}
$("#image-upload-wrap").bind("dragover", function () {
	$("#image-upload-wrap").addClass("image-dropping");
});
$("#image-upload-wrap").bind("dragleave", function () {
	$("#image-upload-wrap").removeClass("image-dropping");
});