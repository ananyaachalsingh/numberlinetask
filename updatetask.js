/*
=========================================================

- Number formatting by experimental block:
  Block 1: American (1,000,000)
  Block 2: American (1,000,000)
  Block 3: Indian   (10,00,000)
  Block 4: Indian   (10,00,000)
 
*/


// =======================================================
// 1. INITIALIZE jsPsych
// =======================================================

const jsPsych = initJsPsych({
  on_finish: function () {
    // Local testing backup.
    // Pavlovia saving is handled by the Pavlovia setup used by
    // the project. This download is useful for local testing.
    jsPsych.data.get().localSave(
      "csv",
      "number_line_estimation_data.csv"
    );
  }
});


// =======================================================
// 2. PARTICIPANT ID
// =======================================================

let participant_id = "";
let participant_name = "";


// =======================================================
// 3. EXPERIMENT CONSTANTS
// =======================================================

const LINE_MIN = 1000;
const LINE_MAX = 1000000000;

// Formatting is assigned by experimental block:
// Block 1 = American
// Block 2 = American
// Block 3 = Indian
// Block 4 = Indian
const BLOCK_FORMATS = [
  "american",
  "american",
  "indian",
  "indian"
];

// Warm-up trials use American formatting.
const WARMUP_FORMAT = "american";


// =======================================================
// 4. NUMBER FORMATTING
// =======================================================

function formatNumber(number, format = WARMUP_FORMAT) {
  if (format === "indian") {
    return new Intl.NumberFormat("en-IN").format(number);
  }

  return new Intl.NumberFormat("en-US").format(number);
}


// =======================================================
// 5. EXACT EXPERIMENTAL STIMULI FROM TABLE 1
// =======================================================



const thousands_stimuli = [
  10, 60, 100, 150, 230, 250, 310, 380, 420,
  480, 500, 580, 640, 680, 720, 780, 840, 890,
  940, 950
].map(function (x) {
  return x * 1000;
});

const millions_stimuli = [
  1, 2, 3, 4, 60, 100, 150, 230, 250, 310, 380,
  420, 480, 500, 580, 640, 680, 720, 780, 840,
  890, 940, 950
].map(function (x) {
  return x * 1000000;
});

const target_numbers = [
  ...thousands_stimuli,
  ...millions_stimuli
];


// Safety check: the paper has 43 unique test stimuli.
if (target_numbers.length !== 43) {
  throw new Error(
    "Stimulus list error: expected 43 unique experimental stimuli."
  );
}


// =======================================================
// 6. WARM-UP STIMULI
// =======================================================



const warmup_numbers = [
  20000,
  75000,
  120000,
  350000,
  650000,
  1500000,
  2500000,
  5000000,
  20000000,
  300000000
];

if (warmup_numbers.length !== 10) {
  throw new Error(
    "Warm-up list error: expected 10 warm-up stimuli."
  );
}


// =======================================================
// 7. CREATE THE 4 EXPERIMENTAL REPETITIONS
// =======================================================


let experimental_trials_data = [];

for (let repetition = 1; repetition <= 4; repetition++) {

  const shuffled = jsPsych.randomization.shuffle(
    target_numbers
  );

  shuffled.forEach(function (number, index) {
    experimental_trials_data.push({
      target: number,
      repetition: repetition,
      position_in_repetition: index + 1
    });
  });
}


// Safety check: 172 experimental placements.
if (experimental_trials_data.length !== 172) {
  throw new Error(
    "Experimental trial count error: expected 172 trials."
  );
}


// =======================================================
// 8. SPLIT INTO 30-TRIAL BLOCKS
// =======================================================



const BLOCK_SIZE = 43;

const experimental_blocks = [];

for (
  let start = 0;
  start < experimental_trials_data.length;
  start += BLOCK_SIZE
) {
  experimental_blocks.push(
    experimental_trials_data.slice(
      start,
      start + BLOCK_SIZE
    )
  );
}


// =======================================================
// 9. PARTICIPANT NAME / ID ENTRY
// =======================================================

const participant_entry = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: `
    <div class="instruction-page">
      <h1>Participant Information</h1>
      <p>Please enter your name or assigned participant ID to begin.</p>
      <div style="margin:24px auto;">
        <label for="participant-name" style="display:block; margin-bottom:12px;">
          Name / Participant ID
        </label>
        <input
          id="participant-name"
          name="participant_name"
          type="text"
          autocomplete="name"
          required
          maxlength="100"
          style="font-size:20px; padding:12px; width:min(90%,420px); box-sizing:border-box;"
        />
        <p id="participant-entry-error" style="color:#b00020; display:none;">
          Please enter your name or participant ID.
        </p>
        <button id="participant-continue" type="button" class="jspsych-btn">
          Continue
        </button>
      </div>
    </div>
  `,
  on_load: function () {
    const input = document.getElementById("participant-name");
    const button = document.getElementById("participant-continue");
    const error = document.getElementById("participant-entry-error");

    input.focus();

    function continueToExperiment() {
      const value = input.value.trim();
      if (!value) {
        error.style.display = "block";
        input.focus();
        return;
      }

      participant_name = value;
      participant_id = value;
      jsPsych.data.addProperties({
        participant_id: participant_id,
        participant_name: participant_name
      });
      jsPsych.finishTrial({
        participant_id: participant_id,
        participant_name: participant_name
      });
    }

    button.addEventListener("click", continueToExperiment);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        continueToExperiment();
      }
    });
  }
};


// =======================================================
// 9. INTRODUCTION
// =======================================================

const welcome = {
  type: jsPsychHtmlButtonResponse,

  stimulus: `
    <div class="instruction-page">
      <h1>Number Line Estimation Task</h1>

      <p>
        Welcome!
      </p>

      <p>
        In this experiment, you will estimate where
        different numbers belong on a number line.
      </p>

      <p>
        You will see a number and a line with two
        labeled endpoints.
      </p>

      <p>
        Your task is to click on the line at the
        location where you think the number belongs.
      </p>

      <p>
        Please use your best estimate.
      </p>

      <p>
        There are no right or wrong responses.
      </p>
    </div>
  `,

  choices: ["Continue"]
};


// =======================================================
// 10. WARM-UP INSTRUCTIONS
// =======================================================

const warmup_instructions = {
  type: jsPsychHtmlButtonResponse,

  stimulus: `
    <div class="instruction-page">
      <h2>Warm-up</h2>

      <p>
        First, you will complete 10 warm-up trials.
      </p>

      <p>
        For each trial, look at the number shown above
        the line and click where you think it belongs.
      </p>

      <p>
        Try to use the entire line as your reference.
      </p>

      <p>
        Click only once on the line for each number.
      </p>
    </div>
  `,

  choices: ["Begin Warm-up"]
};


// =======================================================
// 11. NUMBER-LINE TRIAL FUNCTION
// =======================================================

function createNumberLineTrial(
  target,
  trial_type,
  repetition = null,
  block_number = null,
  trial_in_block = null,
  global_experimental_trial = null,
  warmup_trial_number = null,
  trial_number_format = WARMUP_FORMAT
) {

  return {

    type: jsPsychHtmlKeyboardResponse,

    choices: "NO_KEYS",

    stimulus: function () {

      return `
        <div
          style="
            width:100%;
            margin:45px auto 0 auto;
            text-align:center;
          "
        >

          <div class="instruction">
            Place the following number on the line:
          </div>

          <div class="target-number">
            ${formatNumber(target, trial_number_format)}
          </div>

          <div class="number-line-wrapper">

            <div
              id="number-line"
              class="number-line"
            >

              <div
                class="endpoint left-endpoint"
              >
                ${formatNumber(LINE_MIN, trial_number_format)}
              </div>

              <div
                class="endpoint right-endpoint"
              >
                ${formatNumber(LINE_MAX, trial_number_format)}
              </div>

            </div>

          </div>

          <div class="trial-help">
            Click once on the line.
          </div>

        </div>
      `;
    },

    on_load: function () {

      const line = document.getElementById(
        "number-line"
      );

      const start_time = performance.now();

      let has_responded = false;

      line.addEventListener(
        "click",
        function (event) {

          // Prevent accidental double-click/multiple responses.
          if (has_responded) {
            return;
          }

          has_responded = true;

          const rect =
            line.getBoundingClientRect();

          // X coordinate relative to line.
          let x =
            event.clientX - rect.left;

          // Keep the response inside the line.
          x = Math.max(
            0,
            Math.min(x, rect.width)
          );

          // Normalize to 0–1.
          const estimated_position =
            x / rect.width;

          // Convert the click position back to a number.
          const estimated_number =
            LINE_MIN +
            estimated_position *
            (LINE_MAX - LINE_MIN);

          // Normative mathematical position.
          const actual_position =
            (target - LINE_MIN) /
            (LINE_MAX - LINE_MIN);

          // Absolute error.
          const absolute_error =
            Math.abs(
              estimated_position -
              actual_position
            );

          // Signed error.
          const signed_error =
            estimated_position -
            actual_position;

          // Response time.
          const response_time =
            performance.now() -
            start_time;

          // Record all relevant information.
          jsPsych.finishTrial({

            participant_id: participant_id,

            trial_type: trial_type,

            number_format: trial_number_format,

            target_number: target,

            displayed_number:
              formatNumber(target, trial_number_format),

            line_min: LINE_MIN,

            line_max: LINE_MAX,

            displayed_line_min:
              formatNumber(LINE_MIN, trial_number_format),

            displayed_line_max:
              formatNumber(LINE_MAX, trial_number_format),

            click_x: x,

            line_width_pixels:
              rect.width,

            estimated_position:
              estimated_position,

            actual_position:
              actual_position,

            estimated_number:
              estimated_number,

            absolute_error:
              absolute_error,

            signed_error:
              signed_error,

            response_time_ms:
              response_time,

            repetition:
              repetition,

            block_number:
              block_number,

            trial_in_block:
              trial_in_block,

            global_experimental_trial:
              global_experimental_trial,

            warmup_trial_number:
              warmup_trial_number
          });
        }
      );
    }
  };
}


// =======================================================
// 12. WARM-UP TRIALS
// =======================================================

const shuffled_warmup_numbers = jsPsych.randomization.shuffle(warmup_numbers);

const warmup_trials =
  shuffled_warmup_numbers.map(
    function (number, index) {

      return createNumberLineTrial(
        number,
        "warmup",
        null,
        null,
        null,
        null,
        index + 1,
        WARMUP_FORMAT
      );
    }
  );


// =======================================================
// 13. BLOCK INSTRUCTIONS
// =======================================================

function createBlockInstruction(
  block_number,
  total_blocks,
  trials_in_block
) {

  return {

    type: jsPsychHtmlButtonResponse,

    stimulus: `
      <div class="break-page">

        <h2>
          Block ${block_number} of ${total_blocks}
        </h2>

        <p>
          You are about to complete
          ${trials_in_block} number-line trials.
        </p>

        <p>
          Please continue to estimate each number
          as naturally as possible.
        </p>

        ${
          block_number < total_blocks
            ? `
              <p>
                You will have a short break after
                this block.
              </p>
            `
            : `
              <p>
                This is the final block.
              </p>
            `
        }

      </div>
    `,

    choices: [
      block_number === 1
        ? "Begin Experiment"
        : "Continue"
    ]
  };
}


function createBreakScreen(
  completed_trials,
  total_trials
) {

  return {

    type: jsPsychHtmlButtonResponse,

    stimulus: `
      <div class="break-page">

        <h2>Take a Short Break</h2>

        <p>
          You have completed
          <strong>${completed_trials}</strong>
          of
          <strong>${total_trials}</strong>
          experimental trials.
        </p>

        <p>
          When you are ready, continue to the next block.
        </p>

      </div>
    `,

    choices: ["Continue"]
  };
}


// =======================================================
// 14. EXPERIMENTAL BLOCKS
// =======================================================

const experimental_timeline = [];

let experimental_trial_counter = 0;

for (
  let b = 0;
  b < experimental_blocks.length;
  b++
) {

  const block = experimental_blocks[b];

  const block_number = b + 1;

  // Block heading/instructions.
  experimental_timeline.push(
    createBlockInstruction(
      block_number,
      experimental_blocks.length,
      block.length
    )
  );

  // Trials in this block.
  block.forEach(function (trial_data, index) {

    experimental_trial_counter++;

    experimental_timeline.push(
      createNumberLineTrial(
        trial_data.target,
        "experimental",
        trial_data.repetition,
        block_number,
        index + 1,
        experimental_trial_counter,
        null,
        BLOCK_FORMATS[b]
      )
    );
  });

  // Break after every block except the last.
  if (block_number < experimental_blocks.length) {

    experimental_timeline.push(
      createBreakScreen(
        experimental_trial_counter,
        experimental_trials_data.length
      )
    );
  }
}


// =======================================================
// 15. END SCREEN
// =======================================================

const end_screen = {

  type: jsPsychHtmlButtonResponse,

  stimulus: `
    <div class="instruction-page">

      <h2>Thank You!</h2>

      <p>
        You have completed the experiment.
      </p>

      <p>
        Thank you for participating.
      </p>

    </div>
  `,

  choices: ["Finish"]
};


// =======================================================
// 16. BUILD COMPLETE TIMELINE
// =======================================================

let timeline = [];

timeline.push(participant_entry);

timeline.push(welcome);

timeline.push(warmup_instructions);

timeline = timeline.concat(
  warmup_trials
);

timeline = timeline.concat(
  experimental_timeline
);

timeline.push(end_screen);


// =======================================================
// 17. GLOBAL DATA
// =======================================================

jsPsych.data.addProperties({

  block_1_format: "american",
  block_2_format: "american",
  block_3_format: "indian",
  block_4_format: "indian",

  line_min:
    LINE_MIN,

  line_max:
    LINE_MAX,

  unique_experimental_stimuli:
    target_numbers.length,

  repetitions_per_stimulus:
    4,

  total_experimental_trials:
    experimental_trials_data.length,

  total_warmup_trials:
    warmup_numbers.length,

  block_size:
    BLOCK_SIZE,

  total_experimental_blocks:
    experimental_blocks.length,

  experiment_name:
    "Large Number Line Estimation Task",

  source_article:
    "Landy, Charlesworth, & Ottmar (2017)",

  doi:
    "10.1111/cogs.12342"
});


// =======================================================
// 18. START EXPERIMENT
// =======================================================

jsPsych.run(timeline);
