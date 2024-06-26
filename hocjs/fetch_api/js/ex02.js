/*
Authentication -> Xác thực
- Bạn là ai?
-> Đăng nhập

Authorization -> Ủy quyền
- Bạn được làm gì?
- Bạn không được làm gì?

Phân tích luồng:

- Request Authenticate (Email, Password) => Server Verify => Trả về thông tin (SesionId, Token) => Kết thúc xác thực
- Request Authorization (SessionId, Token) => Server Verify => Lấy ra được thông tin User => Access Data (Database) => Trả về Data

2 hình thức Authentication

1. Session Based Authentication
- Request Authenticate (Email, Password) => Server Verify => Khởi tạo 1 session Id => Trả về cho trình duyệt lưu vào Cookie (Bộ nhớ trình duyệt)
- Request Authorization (Cookie: sessionId) -> Server Verify => Lấy ra được thông tin User => Access Data (Database) => Trả về Data

Nhược điểm: Scale Server (Dự án nằm nhiều ở nhiều Server)
Request => Load Balancer 
+ Server 1
+ Server 2
+ Server 3

2. Token Based Authentication
- Request Authenticate (Email, Password) => Server Verify -> Khởi tạo 1 token (JWT) -> Trả về cho trình duyệt (Trình duyệt tự lưu lại)
- Request Authorization (Header: Authorization: Bearer <token>) -> Server Verify => Lấy ra được thông tin User => Access Data (Database) => Trả về Data
*/
import { client } from "./client.js";
client.create({ serverApi: "https://api.escuelajs.co/api/v1" });
const root = document.querySelector("#root");
const app = {
  loginForm: function () {
    return `<div class="container">
        <div class="row justify-content-center">
          <div class="col-7">
            <h2 class="py-3">Đăng nhập</h2>
            <form class="login">
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label"
                  >Email address</label
                >
                <input
                  type="email"
                  class="form-control"
                  placeholder="Email..."
                  name="email"
                />
              </div>
              <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label"
                  >Password</label
                >
                <input
                  type="password"
                  class="form-control"
                  placeholder="Password..."
                  name="password"
                />
              </div>
    
              <button type="submit" class="btn btn-primary">Đăng nhập</button>
              <div class="msg text-danger"></div>
            </form>
            
          </div>
        </div>
      </div>`;
  },
  dashboard: function () {
    return `
     <div class="container">
        <h2>Chào mừng bạn đã quay trở lại</h2>
        <ul class="list-unstyled d-flex gap-3 profile">
            <li>Chào bạn: <span>Loading...</span></li>
            <li><a href="#" class="logout">Đăng xuất</a></li>
        </ul>
     </div>
    `;
  },
  addEvent: function () {
    root.addEventListener("submit", (e) => {
      if (e.target.classList.contains("login")) {
        this.handleLogin(e);
      }
    });
    root.addEventListener("click", (e) => {
      if (e.target.classList.contains("logout")) {
        e.preventDefault();
        this.handleLogout();
      }
    });
  },
  handleLogin: function (e) {
    e.preventDefault();

    const form = [...new FormData(e.target)];
    const [[, email], [, password]] = form;
    this.postLogin(email, password, e.target);
  },
  postLogin: async function (email, password, el) {
    //Add Loading
    this.loading(el);
    const { response, data } = await client.post("/auth/login", {
      email,
      password,
    });

    //Remove Loading
    this.loading(el, false);
    if (response.ok) {
      //Lưu token lại vào bộ nhớ trình duyệt: cookie, storage (localStorage, sessionStorage)
      localStorage.setItem("login_token", JSON.stringify(data));
      this.render(); //Update UI
      this.getProfile();
    } else {
      this.showMessage(
        el.querySelector(".msg"),
        "Email hoặc mật khẩu không chính xác",
      );
    }
  },
  showMessage: function (msgEl, text) {
    msgEl.innerText = "";
    msgEl.innerText = text;
  },
  loading: function (el, status = true) {
    const btn = el.querySelector("button");
    if (status) {
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Loading...</span>`;
      btn.disabled = true;
    } else {
      btn.innerText = "Đăng nhập";
      btn.disabled = false;
    }
  },
  isLogin: function () {
    if (localStorage.getItem("login_token")) {
      return true;
    }
    return false;
  },
  handleLogout: function () {
    localStorage.removeItem("login_token");
    this.render(); //Render UI
  },
  getProfile: async function () {
    if (localStorage.getItem("login_token")) {
      try {
        let token = localStorage.getItem("login_token");
        const { access_token: accessToken } = JSON.parse(token);

        //Add token vào client
        client.create({ token: accessToken });
        const result = await client.get("/auth/profile");
        //Nếu thành công -> result trả về object, bao gồm response và data
        //Nếu thất bại -> result trả về false
        if (!result) {
          this.handleLogout();
        } else {
          const { data } = result;
          const profileName = root.querySelector(".profile span");
          profileName.innerHTML = data.name;
        }
      } catch (e) {
        //Có lỗi -> Logout
        this.handleLogout();
      }
    }
  },
  render: function () {
    root.innerHTML = this.isLogin() ? this.dashboard() : this.loginForm();
  },
  start: function () {
    this.render();
    this.addEvent();
    this.getProfile();
  },
};

app.start();

/*
Request 1 -> Server Verify Token => Response
- Success -> OK
- Faied (401) 
-> Request Refresh Token => Server Verify Refresh Token
- Failed (401) -> Logout
- Success (Trả về Token mới) -> Lưu token vào localStorage -> Gọi lại Request 1

Request 2 -> Sử dụng access mới

Tránh cấp lại AccessToken nhiều lần

Slider -> ok
Khóa học -> hết hạn -> cấp lại access mới
Bài viết -> hết hạn -> cấp lại access mới

Lưu ý khi logout
- Gọi api /logout --> Backend phải hỗ trợ (Yêu cầu back-end xây dựng)
- Xóa storage

Khi logout --> Token không bị xóa (Trừ phi hết hạn)
--> Gặp vấn đề khi token bị lộ --> Hacker khai thác dữ liệu từ token đó

--> Backend: Thêm token đó vào Blacklist khi user thực hiện logout

--> Khi Authorization --> Check token có trong Blacklist hay không?

Chốt lại các vấn đề: 
- Hiểu và phân biệt được Authentication - Authorization
- Phân biệt các hình thức Authentication: session/cookie, token
- Hiểu được thế nào là JWT
- Code chức năng: Authentication, Authorization
- Phân biệt được accessToken, refreshToken, workflow
- Kỹ thuật cấp lại accessToken khi hết hạn
- Xử lý các bài toán bảo mật: blacklist, fake token,...

Buổi sau: 
- BOM = Browser Object Model
- Date
- Regex

Lộ trình: 
- Package Manager: npm, yarn
- Module Bundler
- React

--> Kết thúc Front-End
*/
