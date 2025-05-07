from django.contrib import admin
from .models import GroceryItem, Cart, OrderHistory, UserInfo

admin.site.register(GroceryItem)
admin.site.register(Cart)
admin.site.register(OrderHistory)
admin.site.register(UserInfo)
