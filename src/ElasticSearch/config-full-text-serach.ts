export const fullTextSearchConfig = {
    "settings": {
      "analysis": {
        "filter": {
          "english_stop": {
            "type": "stop",
            "stopwords": "_english_"
          },
          "english_stemmer": {
            "type": "stemmer",
            "language": "english"
          },
          "asciifolding": {
            "type": "asciifolding",
            "preserve_original": false
          },
          "length_filter": {
            "type": "length",
            "min": 3,
            "max": 25
          }
        },
        "analyzer": {
          "content_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": [
              "lowercase",
              "asciifolding",
              "trim",
              "length_filter",
              "english_stop",
              "english_stemmer",
              "unique"
            ]
          }
        }
      }
    },
    "mappings": {
        "properties": {
            "content": {
                "type": "text",
                "analyzer": "content_analyzer",
            },
            "author": {
                "type": "text",
            },
            "date": {
                "type": "date"
            },
            "id": {
                "type": "text",
            },
            "title": {
                "type": "text",
                
            }
        }
    }
}
  