from flask import Flask, request, jsonify
import os
import sys
import json
import traceback

# Thêm đường dẫn hiện tại vào sys.path để Python có thể tìm thấy các module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.crewai.transcript_analyze_agent import analyze_transcript
from src.crewai.pre_verify_agent import preverify_lead

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    if not data or 'customerPrompt' not in data or 'transcript' not in data:
        return jsonify({
            'error': 'Missing required fields: customerPrompt and transcript'
        }), 400
    
    customer_prompt = data['customerPrompt']
    transcript = data['transcript']
    
    try:
        # Gọi hàm phân tích transcript
        result = analyze_transcript(customer_prompt, transcript)
        
        # Kiểm tra xem kết quả đã ở dạng JSON chưa
        if isinstance(result, dict) and 'error' in result:
            # Trả về lỗi với status code 500
            return jsonify(result), 500
        
        # Trả về kết quả thành công
        return jsonify(result)
    except Exception as e:
        # Log lỗi chi tiết để debug
        error_traceback = traceback.format_exc()
        print(f"Error analyzing transcript: {str(e)}\n{error_traceback}")
        
        return jsonify({
            'error': 'Failed to analyze transcript',
            'message': str(e)
        }), 500

@app.route('/preverify', methods=['POST'])
def preverify():
    data = request.json
    
    if not data or 'leadData' not in data:
        return jsonify({
            'error': 'Missing required field: leadData'
        }), 400
    
    lead_data = data['leadData']
    criteria_field = data.get('criteriaField', None)
    
    try:
        # Chuyển đổi lead_data thành chuỗi JSON nếu nó là đối tượng
        if isinstance(lead_data, dict):
            lead_data = json.dumps(lead_data)
            
        # Gọi hàm xác minh trước lead
        result = preverify_lead(lead_data, criteria_field)
        
        # Kiểm tra xem kết quả đã ở dạng JSON chưa
        if isinstance(result, dict) and 'error' in result:
            # Trả về lỗi với status code 500
            return jsonify(result), 500
        
        # Trả về kết quả thành công
        return jsonify(result)
    except Exception as e:
        # Log lỗi chi tiết để debug
        error_traceback = traceback.format_exc()
        print(f"Error preverifying lead: {str(e)}\n{error_traceback}")
        
        return jsonify({
            'error': 'Failed to preverify lead',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'CrewAI API is running',
        'available_endpoints': [
            '/analyze - Transcript analysis',
            '/preverify - Lead pre-verification',
            '/health - Health check'
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 