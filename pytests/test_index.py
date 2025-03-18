import pytest
from index import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_get_phones(client):
    """測試 /api/phones 路由"""
    rv = client.get('/api/phones')
    json_data = rv.get_json()
    assert rv.status_code == 200
    assert isinstance(json_data, list)
    assert len(json_data) == 3
    for phone in json_data:
        assert 'model' in phone
        assert 'position' in phone
        assert 'scale' in phone
        assert 'rotation' in phone
        assert 'details' in phone
        assert 'name' in phone['details']
        assert 'specs' in phone['details']


def test_serve_index(client):
    """測試 / 路由"""
    rv = client.get('/')
    assert rv.status_code == 200
    assert b'<!DOCTYPE html>' in rv.data


def test_serve_static(client):
    """測試靜態檔案提供"""
    rv = client.get('/index.html')
    assert rv.status_code == 200
    assert b'<!DOCTYPE html>' in rv.data
