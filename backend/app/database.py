from urllib.parse import urlparse, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.config import settings

raw_url = settings.database_url
parsed = urlparse(raw_url)
params = parse_qs(parsed.query)
connect_args = {}
if "sslmode" in params:
    connect_args["ssl"] = params["sslmode"][0] == "require"
    clean = parsed._replace(query="")
    raw_url = urlunparse(clean)

engine = create_async_engine(raw_url, echo=False, connect_args=connect_args, pool_pre_ping=True, pool_recycle=3600)
async_session = async_sessionmaker(engine, expire_on_commit=False)


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
