# CrewAI Transcript Analysis API

API đơn giản để phân tích các cuộc hội thoại dựa trên yêu cầu của khách hàng.

## Cài đặt

### Cài đặt trực tiếp (Windows)

1. Sử dụng file batch tự động:

```bash
run_api.bat
```

2. Hoặc cài đặt thủ công:

```bash
pip install -r requirements.txt
python api_server.py
```

Server sẽ chạy tại địa chỉ: http://localhost:5000

### Sử dụng Docker

1. Xây dựng image Docker:

```bash
docker build -t crewai-transcript-api .
```

2. Chạy container:

```bash
docker run -p 5000:5000 crewai-transcript-api
```

## Sử dụng API với Postman

### Kiểm tra server

- **URL**: `GET http://localhost:5000/health`
- **Kết quả mẫu**:

```json
{
	"status": "healthy",
	"message": "CrewAI Transcript Analysis API is running"
}
```

### Phân tích cuộc hội thoại

- **URL**: `POST http://localhost:5000/analyze`
- **Headers**:
  - Content-Type: application/json
- **Body**:

```json
{
	"customerPrompt": "Company Location: The company must be based in Ho Chi Minh City. Staff Size: At least 10 employees. Budget: More than 10 million VND.",
	"transcript": "Bot: Hello! I'm calling from ABC Tax Services. We help businesses in Ho Chi Minh City with tax filing and financial cost optimization. May I ask where your company is currently located? Customer: We're in Ha Noi. Bot: Thank you! And how many employees does your company currently have? Customer: Around 10 people. Bot: Got it. What is your estimated budget for accounting or tax support services—monthly or annually? Customer: We're considering something between 15 to 20 million VND per year. Bot: That fits well with our service packages. Are you currently managing taxes in-house or working with an external provider? Customer: We've been doing it ourselves, but it's getting complicated so we're thinking about outsourcing. Bot: Understood. Thanks for sharing! Based on what you've told me, I'll send you a detailed quote by email shortly."
}
```

- **Kết quả mẫu (JSON)**:

```json
{
	"pass": false,
	"criteria_results": [
		{
			"criterion": "Company Location",
			"passed": false,
			"reason": "Customer is located in Ha Noi, not Ho Chi Minh City as required."
		},
		{
			"criterion": "Staff Size",
			"passed": true,
			"reason": "Customer has around 10 employees, meeting the minimum requirement of 10 employees."
		},
		{
			"criterion": "Budget",
			"passed": true,
			"reason": "Customer's budget is between 15-20 million VND per year, which is more than the minimum 10 million VND requirement."
		}
	]
}
```

## Định dạng dữ liệu

### Request

API nhận dữ liệu JSON với hai trường bắt buộc:

- `customerPrompt`: Yêu cầu của khách hàng về tiêu chí đánh giá
- `transcript`: Nội dung cuộc hội thoại cần phân tích

### Response

API trả về dữ liệu JSON với cấu trúc:

```json
{
	"pass": boolean,                 // true nếu cuộc hội thoại đạt tất cả tiêu chí
	"criteria_results": [            // danh sách kết quả cho từng tiêu chí
		{
			"criterion": string,     // tên tiêu chí
			"passed": boolean,       // true nếu đạt tiêu chí
			"reason": string         // lý do chi tiết
		},
		...
	]
}
```

## Xử lý lỗi thường gặp

### Lỗi ModuleNotFoundError

Nếu gặp lỗi `ModuleNotFoundError: No module named 'crews'` hoặc lỗi tương tự, đã được sửa trong mã nguồn bằng cách:

1. Thêm đường dẫn hiện tại vào `sys.path` trong file `api_server.py`
2. Sửa đường dẫn import trong file `transcript_analyze_agent.py` để sử dụng đường dẫn tuyệt đối

### Lỗi về thư viện thiếu

Nếu gặp lỗi về thư viện thiếu, chạy lệnh sau để cài đặt đầy đủ:

```bash
pip install -r requirements.txt
```

## Lưu ý

- API này được thiết kế để chạy độc lập khỏi server chính
- Đảm bảo môi trường Python của bạn có phiên bản 3.10 trở lên
- Trên Windows, có thể chạy file `run_api.bat` để cài đặt tự động và khởi động server
- Nếu sử dụng Docker, cần cài đặt Docker trước
