/* ===========================================================
   GAME DATA
   Keep all game content here, separate from UI/game logic.
   Edit these lists freely — no need to touch game.js / main.js.
   =========================================================== */

const GAME_DATA = {
  // Range of drumsticks that can fall (inclusive)
  minDrumsticks: 9,
  maxDrumsticks: 15,

  // Range of choices shown to the player when guessing
  guessMin: 5,
  guessMax: 18,

  truthQuestions: [
    "Crush đầu tiên của bạn là ai?",
    "Điều xấu hổ nhất bạn từng làm trước mặt người bạn thích là gì?",
    "Bạn đã từng nói dối bố mẹ điều gì lớn nhất?",
    "Trong nhóm này, bạn thấy ai dễ thương nhất?",
    "Bạn có đang thích ai đó không? Bật mí xíu đi!",
    "Tin nhắn 'sến súa' nhất bạn từng gửi cho ai đó là gì?",
    "Bạn từng rình xem story của crush bao nhiêu lần trong 1 ngày?",
    "Nếu được nhắn tin cho 1 người ngay bây giờ, bạn sẽ nhắn cho ai?",
    "Bạn từng thích thầm ai trong hội bạn thân chưa?",
    "Kiểu người bạn thích trông như thế nào?"
  ],

  dares: [
    "Nhắn tin cho crush (hoặc người yêu cũ) một câu bất kỳ ngay bây giờ.",
    "Gọi điện cho một người trong danh bạ và hát 1 câu bất kỳ.",
    "Đăng story với caption do người chơi khác đặt.",
    "Bắt chước giọng nói của một người trong nhóm trong 1 phút.",
    "Gửi tin nhắn 'Anh/em nhớ bạn ghê' cho người thứ 3 trong danh bạ.",
    "Nhảy một điệu nhảy bất kỳ trong 15 giây và quay video.",
    "Đổi ảnh đại diện thành ảnh do người khác chọn trong 10 phút.",
    "Kể một bí mật nhỏ mà chưa ai trong nhóm biết.",
    "Để người chơi kế bên trang điểm/vẽ lên mặt bạn trong 1 phút.",
    "Làm mặt hài hước nhất có thể và chụp lại."
  ]
};
