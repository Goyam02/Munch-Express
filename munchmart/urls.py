from django.urls import path
from . import views

app_name = 'munchmart'

urlpatterns = [
    path('grocery/', views.index_grocery, name='index_grocery'),
    path('products/', views.products, name='products'),
    path('cart/', views.cart, name='cart_munch'),
]