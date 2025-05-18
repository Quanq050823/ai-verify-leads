import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    # MongoDB configuration
    MONGO_URI = os.getenv('MONGO_URI')

    # Google OAuth configuration
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
    GOOGLE_CALENDAR_REDIRECT_URI = os.getenv('GOOGLE_CALENDAR_REDIRECT_URI')
    RABBITMQ_URL = os.getenv('RABBITMQ_URL')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')

    @staticmethod
    def validate_config():
        """Validate that all required environment variables are set."""
        required_vars = [
            'MONGO_URI',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_REDIRECT_URI',
            'GOOGLE_CALENDAR_REDIRECT_URI',
            'RABBITMQ_URL',
            'OPENAI_API_KEY',
            'OPENAI_MODEL'
        ]

        missing_vars = [var for var in required_vars if not getattr(Config, var)]

        if missing_vars:
            raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

        return True
