import sys
from predict import predict
import numpy as np


data = sys.stdin.buffer.read(56*56)
image = np.frombuffer(data, dtype=np.uint8)
result = predict(image)

labels = ['4', '3', '0', 'P', '9', 'A', 'L', '7', 'D', 'V', 'I', 'F', 'C',
        'N', '8', 'W', 'S', 'G', 'K', 'Z', 'T', 'Y', 'M', 'O', '5', 'E',
        'J', 'H', '2', '6', 'N', 'U', 'R', '1', 'Q', 'B']

s = ""
# Pierwszy najlepszy
ind = np.argmax(result)
s += str(labels[ind]) + ": " + "%.2f" % result[ind] + "\n"
result[ind] = -1
# Drugi najlepszy
ind = np.argmax(result)
s += str(labels[ind]) + ": " + "%.2f" % result[ind] + "\n"
result[ind] = -1
# Trzeci najlepszy
ind = np.argmax(result)
s += str(labels[ind]) + ": " + "%.2f" % result[ind] + "\n"

print(s)
