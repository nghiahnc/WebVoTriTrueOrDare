/* ===========================================================
   GAME CONFIG & FALLBACK DATA
   =========================================================== */

const GAME_CONFIG = {
  minFlowers: 40,
  maxFlowers: 60,
  timeLimit: 6,
  maxLosses: 2,
  flowers: [
    "🌸",
    "🌼",
    "🌺",
    "🌻",
    "🌹",
    "🌷",
    "💐"
  ]
};

// Fallback questions if Google Sheet network is offline or unconfigured
const FALLBACK_QUESTIONS = [
  // Level 1 Truths
  { id: "001", type: "truth", level: 1, content: "Bạn từng crush ai trong nhóm/bạn bè mà chưa từng dám nói?", active: true },
  { id: "002", type: "truth", level: 1, content: "Điều gì khiến bạn thấy xấu hổ và muốn 'độn thổ' nhất?", active: true },
  { id: "003", type: "truth", level: 1, content: "Tin nhắn sến súa nhất bạn từng gửi cho ai đó là gì?", active: true },
  { id: "004", type: "truth", level: 1, content: "Bạn đã từng nói dối điều gì lớn nhất với gia đình?", active: true },

  // Level 1 Dares
  { id: "005", type: "dare", level: 1, content: "Tạo dáng chụp hình ngầu/hài hước nhất có thể và giữ trong 10s!", active: true },
  { id: "006", type: "dare", level: 1, content: "Nói một câu thả thính cực sến với người bên cạnh bạn!", active: true },
  { id: "007", type: "dare", level: 1, content: "Bắt chước tiếng kêu của 3 con vật liên tiếp!", active: true },
  { id: "008", type: "dare", level: 1, content: "Hát một đoạn nhạc ngắn bằng giọng em bé!", active: true },

  // Level 2 Truths (Harder for Loss #2)
  { id: "009", type: "truth", level: 2, content: "Bí mật lớn nhất bạn đang giấu mọi người hiện tại là gì?", active: true },
  { id: "010", type: "truth", level: 2, content: "Bạn từng lén rình xem profile/story của ai nhiều nhất trong tuần qua?", active: true },
  { id: "011", type: "truth", level: 2, content: "Hãy kể về lần bạn bị từ chối tình cảm cay đắng nhất!", active: true },
  { id: "012", type: "truth", level: 2, content: "Nếu phải đổi tên hoặc tính cách của bạn, bạn muốn thay đổi điều gì?", active: true },

  // Level 2 Dares (Harder for Loss #2)
  { id: "013", type: "dare", level: 2, content: "Gọi điện/nhắn tin cho 1 người bạn trong danh bạ và nói: 'Mình nhớ bạn quá!'", active: true },
  { id: "014", type: "dare", level: 2, content: "Vẽ một hình ngộ nghĩnh lên tay mình và giữ nguyên trong 10 phút!", active: true },
  { id: "015", type: "dare", level: 2, content: "Uống một ngụm nước búp trà/chanh chua mà không được nhăn mặt!", active: true },
  { id: "016", type: "dare", level: 2, content: "Nhảy theo 1 điệu nhảy hot trend trên TikTok trong 15 giây!", active: true }
];
