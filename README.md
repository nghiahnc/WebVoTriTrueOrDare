# Đoán số đùi gà 🍗 — mini game

## 1. Project structure

```
kfc-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js         # game content (truth/dare lists, drop range) — edit freely
│   ├── starfield.js     # falling-star background effect
│   ├── gsheet.js        # Google Sheet submission (needs webAppUrl, see below)
│   ├── game.js           # core game logic (round, guess check, drop animation)
│   └── main.js           # screen/step flow, DOM wiring
├── google-apps-script/
│   └── Code.gs           # paste into your Apps Script project
└── README.md
```

Open `index.html` directly in a browser, or serve the folder with any static
file server — no build step needed.

## 2. Google Sheet setup — do this manually

I can't create the Sheet or generate a Web App URL for you (that requires
your own Google account), so here's exactly what to do:

### Step A — Create the Sheet
1. Create a new Google Sheet (any name you like, e.g. **"KFC Game Data"**).
2. You don't need to add headers yourself — the script creates a tab named
   **`Submissions`** with the correct header row automatically the first
   time someone submits. (If you'd rather set it up by hand, use the columns
   below in this exact order.)

**Sheet name:** `Submissions`

**Column names (row 1, in order):**
| # | Column |
|---|---|
| 1 | timestamp |
| 2 | playerName |
| 3 | game |
| 4 | guessedNumber |
| 5 | correctNumber |
| 6 | result |
| 7 | trueOrDare |
| 8 | questionOrDare |
| 9 | playerAnswer |

### Step B — Add the Apps Script
1. In your Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code, then paste the full contents of
   `google-apps-script/Code.gs` from this project.
3. Save the project (any name, e.g. "KFC Game Backend").

### Step C — Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access** and approve the permissions
   (it's your own script, acting on your own Sheet).
5. Copy the **Web app URL** shown (looks like
   `https://script.google.com/macros/s/AKfycb..../exec`).

### Step D — the one thing I need from you
Send me that **Web app URL**, and paste it into:

```js
// js/gsheet.js
const GSHEET_CONFIG = {
  webAppUrl: "PASTE_YOUR_URL_HERE"
};
```

Until this is filled in, the game still works end-to-end — submissions are
just skipped with a friendly toast ("Chưa kết nối Google Sheet...") instead
of being saved, so nothing breaks or hangs.

> If you ever need to redeploy after editing `Code.gs`, use
> **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** —
> editing the script alone does not update a live deployment.

## 3. What I need from you (summary)
- [ ] The deployed Web App URL from Step C above.
- That's it — no other IDs, keys, or credentials required.

## 4. Test checklist

- [ ] Enter a name → lands on Main Menu, name shown correctly.
- [ ] Reload the page → name is remembered (skips straight to menu).
- [ ] "Đổi tên" (Change name) → returns to name screen, previous name pre-filled.
- [ ] Tap the game tile → drumsticks fall into the KFC box, count varies 9–15 across replays.
- [ ] Guess grid appears after the drop finishes; selecting a number enables "Chốt đáp án!".
- [ ] Correct guess → win result + copy shown.
- [ ] Wrong guess → fail result showing your guess vs. the correct number.
- [ ] Truth/Dare buttons both lead to a prompt step with a random question/dare.
- [ ] Submitting without typing an answer shows the inline error and does not submit.
- [ ] Submitting a valid answer: button shows a loading spinner, then a success toast, then moves to the final screen.
- [ ] Win screen shows: "Bạn thắng rồi! Hãy chụp màn hình kết quả và gửi cho Chí Nghĩa nhé!"
- [ ] Rapid double-tapping "Gửi câu trả lời" only submits once (duplicate guard).
- [ ] With `webAppUrl` unset: game still completes normally, toast says the Sheet isn't connected yet.
- [ ] With `webAppUrl` set: a new row appears in the `Submissions` tab after each submission.
- [ ] Turn off Wi-Fi/network and submit: shows a failure toast, re-enables the button so the user can retry, UI never freezes.
- [ ] Test on a real mobile screen width (~360–390px): buttons large and tappable, no horizontal scroll, falling stars don't cause jank.
- [ ] "Về menu chính" from the done screen returns to the Main Menu correctly, and playing again produces a fresh random drumstick count.
