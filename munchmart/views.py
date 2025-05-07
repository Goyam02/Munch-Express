from django.shortcuts import render

# Create your views here.


def index_grocery(request):
    return render(request, 'munchmart/index_grocery.html')

def products(request):
    return render(request, 'munchmart/products.html')

def cart(request):
    return render(request, 'munchmart/cart_munch.html')
