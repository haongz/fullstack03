# Thư viện Redux

- Thư viện quản lý Global State dành cho các ứng dụng được xây dựng bằng JS
- KHÔNG PHẢI của React

# Các thành phần của Redux

- Store: Kho chứa state của dự án
- Reducer: Hàm xử lý logic cập nhật state theo yêu cầu từ phía UI gửi lên
- Action: Object mô tả hành động từ phía UI gửi lên Reducer
- Dispatch: Hàm chứa action cần gửi lên Reducer. Gửi hành động lên Reducer để cập nhật State
- Subscribe: Lắng nghe sự thay đổi State trên Store
- Action Creator: Hàm trả về 1 action

# Cách tính hợp Redux vào React

## Cách 1: Dùng Redux Core

- Cài thư viện Redux
- Cài thư viện react-redux: Xử lý re-render khi state thay đổi, hook: useDispatch, useSelector
- Tự cấu hình

Tình huống đặt ra:

Cần lấy dữ liệu từ phía Server và lưu vào State Global (Redux)

Giải pháp cũ:

- Tạo state trên Redux
- Tạo Reducer trên Redux
- Call API ở phía component
- Dispatch lên Reducer
  --> Không nên dùng vì không theo Flow của Redux

## Cách 2: Dùng Redux Toolkit

- Bản đóng gói của Redux: Code ít hơn, nhanh hơn, cấu hình đơn giản hơn
- Cài thư viện react-redux: Xử lý re-render khi state thay đổi, hook: useDispatch, useSelector
