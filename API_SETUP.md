## API Documentation Setup
[Link to Documentation](http://docs.blog64.apiary.io/#)

### Software
* [API Blueprint](https://apiblueprint.org)
* [Apiary.io](https://apiary.io)

## Installation Instructions
* Use the [Apiary CLI](https://github.com/apiaryio/apiary-client)

```
gem install apiaryio
```

## Previewing the API Documentation
```
apiary preview --browser=chrome --path=./apiary.apib --server --watch
```
I am assuming that you are in the same directory as the `apiary.apib` file. If not, change the path in the command.

## Generating the html file
```
apiary preview --path=./apiary.apib --output=index.html
```