from setuptools import setup, find_packages

setup(
    name="pdf-translator-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "pydantic",
        "pydantic-settings",
        "python-multipart",
    ],
) 