from django.db import models
from django.contrib.auth.models import User

class UserInfo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_info')
    phone_number = models.CharField(max_length=10, unique=True)
    email = models.EmailField(unique=True)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s contact info"

    class Meta:
        ordering = ['-created_at']

class GroceryItem(models.Model):
    name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=50) 
    company = models.CharField(max_length=50) 
    price = models.DecimalField(max_digits=8, decimal_places=2)
    review = models.CharField(max_length=50)
    image = models.URLField(max_length=200)
    type = models.CharField(max_length=50, choices=[
        ('vegetable', 'Vegetable'),
        ('fruit', 'Fruit'),
        ('dairy', 'Dairy'),
        ('grain', 'Grain'),
        ('snack', 'Snack'),
        ('beverage', 'Beverage'),
    ])

    def __str__(self):
        return f"{self.name} - {self.quantity} @ ₹{self.price}"

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    grocery_item = models.ForeignKey(GroceryItem, on_delete=models.CASCADE, related_name='cart_items')
    user_info = models.ForeignKey(UserInfo, on_delete=models.SET_NULL, null=True, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total_gst = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s cart - {self.grocery_item.name} x {self.quantity}"

    class Meta:
        ordering = ['-created_at']

class OrderHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    user_info = models.ForeignKey(UserInfo, on_delete=models.SET_NULL, null=True, related_name='orders')
    grocery_item = models.ForeignKey(GroceryItem, on_delete=models.CASCADE, related_name='order_history')
    quantity = models.PositiveIntegerField()
    total_payment = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateField(auto_now_add=True)
    order_time = models.TimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='pending')

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.grocery_item.name}"

    class Meta:
        ordering = ['-order_date', '-order_time']
        verbose_name_plural = 'Order History'