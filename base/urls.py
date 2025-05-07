from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('cart/', views.cart, name='cart'),
    path('six/', views.SarwanaBhawan, name='SarwanaBhawan'),
    path('three/', views.MughalsKitchen, name='MughalsKitchen'),
    path('five/', views.TajPalace, name='TajPalace'),
    path('four/', views.PunjabGrill, name='PunjabGrill'),
    path('two/', views.DosaPlaza, name='DosaPlaza'),
    path('one/', views.BiryaniHouse, name='BiryaniHouse'),
    path('payment/', views.payment, name='payment'),
   
]