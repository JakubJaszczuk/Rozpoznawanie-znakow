import pickle as pkl
import numpy as np


def max_pool(mat):
	M, N = mat.shape
	K = 2
	L = 2
	MK = M // K
	NL = N // L
	return mat[:MK * K, :NL * L].reshape(MK, K, NL, L).max(axis=(1, 3))


def avg_pool(mat):
	M, N = mat.shape
	K = 2
	L = 2
	MK = M // K
	NL = N // L
	return mat[:MK * K, :NL * L].reshape(MK, K, NL, L).mean(axis=(1, 3))


def add_padding(mat, row_col):
	return np.pad(mat, row_col, 'constant', constant_values=0)


def conv2d(mat, kernel):
	s = kernel.shape + tuple(np.subtract(mat.shape, kernel.shape) + 1)
	strd = np.lib.stride_tricks.as_strided
	subM = strd(mat, shape=s, strides=mat.strides * 2)
	return np.einsum('ij,ijkl->kl', kernel, subM)


def softmax(vec):
	x = np.exp(vec)
	return x / np.sum(x)


def relu(x):
	return np.maximum(0, x)


# Zwracaj 3 najlepsze wartości(prawdopodibieństwa, a nie gotowe labelki)

def predict(i):
	with open('learn.pkl', mode='rb') as file:
		dictionary = pkl.load(file)

	# Zamiana wektora na obrazek 2D
	input_layer = np.reshape(i, [56, 56])

	# Zeskalowanie obrazka by był mniejszy
	pool1 = avg_pool(input_layer)

	# Pierwsza konwolucja
	conv1 = []
	for j in range(4):
		# Dodanie zer na około i policzenie
		temp = conv2d(add_padding(pool1, 2), dictionary['conv1/kernel'][:,:,0,j])
		temp = relu(temp)
		conv1.append(temp)

	# 2 konwolucja, kilka kanałów na wejściu
	conv2 = []
	pool2 = []
	for j in range(8):
		temp = []
		# Kanały wejściowe
		for k in range(4):
			temp.append(conv2d(add_padding(conv1[k], 1), dictionary['conv2/kernel'][:, :, k, j]))
		temp = np.sum(temp, axis=0)
		temp = relu(temp)
		conv2.append(temp)
		pool2.append(max_pool(conv2[j]))

	# 3 konwolucja, kilka kanałów na wejściu
	conv3 = []
	pool3 = []
	for j in range(16):
		temp = []
		# Kanały wejściowe
		for k in range(8):
			temp.append(conv2d(add_padding(pool2[k], 1), dictionary['conv3/kernel'][:, :, k, j]))
		temp = np.sum(temp, axis=0)
		temp = relu(temp)
		conv3.append(temp)
		pool3.append(max_pool(conv3[j]))

	pool3_re = np.moveaxis(pool3, 0, -1)

	final = np.reshape(pool3_re, 7 * 7 * 16)

	return softmax(final @ dictionary['dense/kernel'] + dictionary['dense/bias'])
