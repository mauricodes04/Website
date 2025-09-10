# bridge.py
# Reads JSON lines from stdin and broadcasts them over a WebSocket on ws://localhost:8765
# Usage:
#   pip install websockets
#   python simulator.py | python bridge.py
# Then open index.html in your browser.
import asyncio, sys, threading
import websockets

CLIENTS = set()

async def producer(queue: asyncio.Queue[str]):
    """Consume lines from queue and broadcast to all connected clients."""
    while True:
        msg = await queue.get()
        if msg is None:  # sentinel -> stdin closed
            break
        dead = []
        for ws in list(CLIENTS):
            try:
                await ws.send(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            CLIENTS.discard(ws)

async def handler(websocket):
    CLIENTS.add(websocket)
    try:
        # Keep connection open; we don't expect messages from clients.
        await websocket.wait_closed()
    finally:
        CLIENTS.discard(websocket)

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 8765, ping_interval=20, ping_timeout=20)
    print("WebSocket server listening on ws://localhost:8765", file=sys.stderr, flush=True)

    # Create a queue and a background thread to read blocking stdin safely on Windows
    loop = asyncio.get_running_loop()
    q: asyncio.Queue[str] = asyncio.Queue(maxsize=1000)

    def stdin_reader():
        try:
            for raw in sys.stdin.buffer:
                try:
                    line = raw.decode("utf-8", errors="ignore")
                except Exception:
                    line = raw.decode("latin-1", errors="ignore")
                # Enqueue into asyncio queue from thread safely
                try:
                    loop.call_soon_threadsafe(q.put_nowait, line)
                except Exception:
                    pass
        except Exception:
            pass
        finally:
            # Signal closure via sentinel None
            try:
                loop.call_soon_threadsafe(q.put_nowait, None)
            except Exception:
                pass

    t = threading.Thread(target=stdin_reader, name="stdin-reader", daemon=True)
    t.start()

    try:
        await producer(q)
    finally:
        server.close()
        await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
