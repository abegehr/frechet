from setuptools import setup

setup(
    name='Fréchet Webapp',
    version='0.1',
    long_description=__doc__,
    packages=['frechet_server', 'frechet_alg'],
    include_package_data=True,
    zip_safe=False,
    install_requires=['Flask']
)