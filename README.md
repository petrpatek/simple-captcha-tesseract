# Tesseract OCR - simple captcha solver
Handy simple captcha solving using Tesseract OCR.

## Input
Actor accepts an array of urls strings. Supported image formats are `GIF`, `PNG`, `JPG`.

___Example Input:___
```javascript
[
  "https://apl.cnb.cz/apljerrsdad/JERRS.WEB45.SEND_IMG_FROM_WWW_DOKUMENTY?p_name=20190406183622$671655$353726.GIF",
  "https://apl.cnb.cz/apljerrsdad/JERRS.WEB45.SEND_IMG_FROM_WWW_DOKUMENTY?p_name=20190406183622$672364$964245.GIF",
  "https://apl.cnb.cz/apljerrsdad/JERRS.WEB45.SEND_IMG_FROM_WWW_DOKUMENTY?p_name=20190406183622$672842$650068.GIF",
  "https://apl.cnb.cz/apljerrsdad/JERRS.WEB45.SEND_IMG_FROM_WWW_DOKUMENTY?p_name=20190406183622$673350$784004.GIF",
  "https://apl.cnb.cz/apljerrsdad/JERRS.WEB45.SEND_IMG_FROM_WWW_DOKUMENTY?p_name=20190406183622$673808$143468.GIF",
  "https://apl.cnb.cz/apljerrsdad/JERRS.WEB45.SEND_IMG_FROM_WWW_DOKUMENTY?p_name=20190406183622$674280$435182.GIF"
]
```

## Output
Output is an array with corresponding numbers from the simple captcha.

___Example Input:___
```javascript
[
  "0\n\n",
  "1\n\n",
  "6\n\n",
  "8\n\n",
  "3\n\n",
  "7\n\n"
]
```