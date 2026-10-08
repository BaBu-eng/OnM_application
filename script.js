const $ = (id) => document.getElementById(id);
const val = (id) => $(id).value;
const form = $("inspectionForm");
const log = (msg) => {
  $("logMessage").textContent = msg;
};

// Show/hide a block and disable its inputs while hidden,
// so hidden "required" fields never block submission.
function show(el, visible) {
  el.hidden = !visible;
  el.querySelectorAll("input,select").forEach((i) => {
    i.disabled = !visible;
  });
}

function update() {
  const hold = val("proceedJob") === "Address",
    rem = !hold;
  const access = val("meterAccessibleSelect") === "Yes";
  const availNo = val("meterAvailableSelect") === "No";
  const general = rem && access && !availNo; // category, hardware, meter issue
  const post = rem && access && !availNo; // meter serial, kWh, photo, etc.
  const power = val("meterPowerSelect") === "Yes";
  const hwYes = val("hardwareRequiredSelect") === "Yes";

  // Parents first, then children (a parent re-enables its descendants)
  show($("addressReasonGroup"), hold);
  show($("remainingJobFields"), rem);
  show($("generalFields"), general);
  show($("hardwareReasonGroup"), general && hwYes);
  show($("meterReasonGroup"), general && val("meterIssueSelect") === "Yes");
  show($("meterAccessibleReasonGroup"), rem && !access);
  show($("meterAvailableGroup"), rem && access);
  show($("meterAvailableReasonGroup"), rem && access && availNo);
  show($("postMeterAvailableFields"), post);
  show($("meterMismatchGroup"), post && val("meterMismatchSelect") === "Yes");
  show($("meterPowerReasonGroup"), post && !power);
  show($("meterErrorGroup"), post && val("meterErrorSelect") === "Yes");

  // Change checklist depends on the hardware type
  const opts = { simCardOption: true, nicCardOption: true };
  Object.entries(opts).forEach(([id, v]) => {
    const el = $(id),
      box = el.querySelector("input");
    const mismatch = post && (val("meterMismatchSelect") === "Yes" || !power);
    el.hidden = !(post && (v || mismatch));
    box.disabled = el.hidden || mismatch; // greyed out on mismatch
    el.style.opacity = mismatch ? ".45" : "";
    if (box.disabled) box.checked = false;
  });

  // kWh / photo / OCR needed only if the meter powered up; error needed if not
  // Faulty-type statuses make Meter OCR and kWh optional
  const optionalStatus = [
    "Faulty",
    "No display",
    "Meter Burnt",
    "Meter Damage",
    "Meter Bye pass",
  ].includes(val("meterStatus"));
  const readingReq = power && !optionalStatus;
  $("meterKwh").required = readingReq;
  $("meterPhoto").required = power;
  $("meterOcrRequiredMark").hidden = $("meterKwhRequiredMark").hidden =
    !readingReq;
  $("meterPhotoRequiredMark").hidden = !power;
  $("meterErrorRequiredMark").hidden = power;
  $("meterErrorSelect").required = !power;
  $("meterErrorCode").required = true;
}

form.addEventListener("change", (e) => {
  if (e.target.type === "file") {
    e.target.closest(".upload-box").querySelector(".file-name").textContent = e
      .target.files[0]
      ? e.target.files[0].name
      : "No file chosen";
  }
  update();
});

// Camera / upload buttons
form.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.action) {
    const input = btn.closest(".upload-box").querySelector("input[type=file]");
    if (btn.dataset.action === "camera")
      input.setAttribute("capture", "environment");
    else input.removeAttribute("capture");
    input.click();
  } else if (btn.title === "Scan") {
    log("QR / barcode scanner needs camera access (not wired up yet).");
  } else if (btn.id === "meterOcrBtn") {
    log("Meter OCR is not wired up yet.");
  }
});

$("performRead").addEventListener("click", () => {
  log("Reading meter...");
  setTimeout(
    () => log("Read complete (demo). Connect a real meter/API here."),
    1500,
  );
});

$("directionBtn").addEventListener("click", () => {
  window.open(
    "https://www.google.com/maps/dir/?api=1&destination=19.7069207,77.171852",
    "_blank",
  );
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {};
  form.querySelectorAll("input,select").forEach((el) => {
    if (el.disabled || !el.id) return;
    data[el.id] =
      el.type === "checkbox"
        ? el.checked
        : el.type === "file"
          ? el.files[0]
            ? el.files[0].name
            : ""
          : el.value;
  });
  console.log("Inspection data:", data);
  log(
    "Submitted at " +
      new Date().toLocaleTimeString() +
      " (" +
      Object.keys(data).length +
      " fields)",
  );
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
});

update();
