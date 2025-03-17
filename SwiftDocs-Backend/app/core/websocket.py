from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        # 存储所有活动的WebSocket连接
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """建立新的WebSocket连接"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        """关闭WebSocket连接"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_personal_message(self, message: str, client_id: str):
        """向特定客户端发送消息"""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)
    
    async def broadcast(self, message: str):
        """向所有连接的客户端广播消息"""
        for connection in self.active_connections.values():
            await connection.send_text(message)
    
    async def send_json(self, data: dict, client_id: str):
        """向特定客户端发送JSON数据"""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)
    
    async def broadcast_json(self, data: dict):
        """向所有连接的客户端广播JSON数据"""
        for connection in self.active_connections.values():
            await connection.send_json(data)
    
    def get_client_count(self) -> int:
        """获取当前连接的客户端数量"""
        return len(self.active_connections)
    
    def is_connected(self, client_id: str) -> bool:
        """检查客户端是否已连接"""
        return client_id in self.active_connections 