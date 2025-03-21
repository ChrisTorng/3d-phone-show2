from flask import Flask, jsonify, send_from_directory
import os

app = Flask(__name__)

@app.route('/api/phones', methods=['GET'])
def get_phones():
    """
    取得所有手機模型的資訊。
    返回一個包含手機模型資訊的 JSON 陣列。
    """
    phones = [
        {
            'model': 'models/iphone_16_pro_max.glb',
            'position': {'x': -2, 'y': 0, 'z': 0},
            'scale': 1,
            'rotation': {'x': 0, 'y': 3.14 / 2, 'z': 0},
            'details': {
                'name': 'iPhone 16 Pro Max',
                'specs': {
                    'display': '6.9-inch Super Retina XDR',
                    'chip': 'A18 Pro',
                    'storage': ['256GB', '512GB', '1TB'],
                    'camera': '108 MP'
                }
            }
        },
        {
            'model': 'models/samsung_galaxy_s22_ultra.glb',
            'position': {'x': 0, 'y': -0.8, 'z': 0},
            'scale': 0.3,
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'details': {
                'name': 'Samsung Galaxy S22 Ultra',
                'specs': {
                    'display': '6.8-inch Dynamic AMOLED',
                    'chip': 'Snapdragon 8 Gen 1',
                    'storage': ['128GB', '256GB', '512GB', '1TB'],
                    'camera': '108 MP'
                }
            }
        },
        {
            'model': 'models/Samsung_Galaxy_Z_Flip_3.glb',
            'position': {'x': 2, 'y': 0, 'z': 0},
            'scale': 1.5,
            'rotation': {'x': 0, 'y': 3.14, 'z': 0},
            'details': {
                'name': 'Samsung Galaxy Z Flip 3',
                'specs': {
                    'display': '6.7-inch Foldable Dynamic AMOLED',
                    'chip': 'Snapdragon 888',
                    'storage': ['128GB', '256GB'],
                    'camera': '12 MP'
                }
            }
        }
    ]
    return jsonify(phones)

@app.route('/', methods=['GET'])
def serve_index():
    """
    提供 index.html 檔案。
    """
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_static(path):
    """
    提供靜態檔案。
    """
    return send_from_directory(os.path.abspath(os.path.dirname(__file__)), f'./{path}')

if __name__ == '__main__':
    app.run(debug=True)
