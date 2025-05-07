from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib import messages
from email_validator import validate_email, EmailNotValidError
from verify_email import verify_email
from munchmart.models import UserInfo
import asyncio
import threading
import re

# Create your views here.
# def home(request):
#     return render(request, 'base/home.html')

@login_required(login_url='login')
def index(request):
    return render(request, 'base/index.html', {
        'user': request.user
    })

def validate_phone_number(phone):
    """
    Validates and formats phone number
    Returns: (is_valid, formatted_number, error_message)
    """
    # Remove any non-digit characters
    phone = re.sub(r'\D', '', phone)
    
    # Check if the number is empty
    if not phone:
        return False, None, "Phone number cannot be empty"
    
    # Check if the number is too short or too long
    if len(phone) < 10:
        return False, None, "Phone number must be at least 10 digits"
    if len(phone) > 15:
        return False, None, "Phone number cannot be longer than 15 digits"
    
    # If number starts with country code (e.g., 91 for India)
    if len(phone) > 10:
        # Check if it's a valid country code
        if not phone.startswith(('91', '1', '44', '61')):  # Add more country codes as needed
            return False, None, "Invalid country code"
        # Remove country code for storage
        phone = phone[-10:]
    
    # Final format check
    if not re.match(r'^[6-9]\d{9}$', phone):  # Indian mobile number format
        return False, None, "Invalid phone number format. Must start with 6-9 and be 10 digits"
    
    return True, phone, None

def login_view(request):
    if request.user.is_authenticated:
        return redirect('index')
        
    if request.method == 'POST':
        login_type = request.POST.get('login_type', 'email')
        password = request.POST.get('password')
        
        if login_type == 'email':
            login_identifier = request.POST.get('login_identifier')
            if not login_identifier or not password:
                messages.error(request, 'Please fill in all fields')
                return render(request, 'base/login.html')

            # Try to find user by email first
            try:
                user = User.objects.get(email=login_identifier)
                username = user.username
            except User.DoesNotExist:
                # If email doesn't exist, try username
                username = login_identifier
        else:  # phone login
            phone = request.POST.get('phone_login')
            if not phone or not password:
                messages.error(request, 'Please fill in all fields')
                return render(request, 'base/login.html')
                
            # Validate phone number
            is_valid, formatted_phone, error_message = validate_phone_number(phone)
            if not is_valid:
                messages.error(request, error_message)
                return render(request, 'base/login.html')
                
            # Try to find user by phone number
            try:
                user_info = UserInfo.objects.get(phone_number=formatted_phone)
                username = user_info.user.username
            except UserInfo.DoesNotExist:
                messages.error(request, 'No account found with this phone number')
                return render(request, 'base/login.html')

        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            messages.error(request, 'Invalid credentials')
            
    return render(request, 'base/login.html')

def verify_email_async(email):
    """Run email verification in a separate thread"""
    try:
        is_valid = verify_email(email)
        return is_valid
    except Exception as e:
        return False

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('index')
        
    if request.method == 'POST':
        register_type = request.POST.get('register_type', 'email')
        username = request.POST.get('username')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        if not username or not password1 or not password2:
            messages.error(request, 'Please fill in all fields')
            return render(request, 'base/login.html')
            
        if register_type == 'email':
            email = request.POST.get('email')
            if not email:
                messages.error(request, 'Please enter your email')
                return render(request, 'base/login.html')
                
            # Basic email format validation
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                messages.error(request, 'Please enter a valid email address')
                return render(request, 'base/login.html')
                
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                messages.error(request, 'Email already registered')
                return render(request, 'base/login.html')
                
            # Optional: Verify if it's a real email address
            try:
                verification_thread = threading.Thread(target=lambda: verify_email_async(email))
                verification_thread.start()
                verification_thread.join(timeout=3)
                
                if not verification_thread.is_alive():
                    if not verify_email_async(email):
                        messages.warning(request, 'Email verification failed, but you can still proceed with registration')
                else:
                    messages.info(request, 'Email verification is pending. You can still proceed with registration.')
            except Exception as e:
                messages.warning(request, 'Email verification failed, but you can still proceed with registration')
                
        else:  # phone registration
            phone = request.POST.get('phone')
            if not phone:
                messages.error(request, 'Please enter your phone number')
                return render(request, 'base/login.html')
                
            # Validate and format phone number
            is_valid, formatted_phone, error_message = validate_phone_number(phone)
            if not is_valid:
                messages.error(request, error_message)
                return render(request, 'base/login.html')
                
            if UserInfo.objects.filter(phone_number=formatted_phone).exists():
                messages.error(request, 'Phone number already registered')
                return render(request, 'base/login.html')
            
        if password1 != password2:
            messages.error(request, 'Passwords do not match')
            return render(request, 'base/login.html')
            
        if len(password1) < 8:
            messages.error(request, 'Password must be at least 8 characters long')
            return render(request, 'base/login.html')
            
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return render(request, 'base/login.html')
            
        try:
            user = User.objects.create_user(username=username, password=password1)
            if register_type == 'email':
                user.email = email
                user.save()
            else:
                # Create UserInfo for phone number
                UserInfo.objects.create(user=user, phone_number=formatted_phone, email='')
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('index')
        except Exception as e:
            messages.error(request, f'Error creating user: {str(e)}')
            
    return render(request, 'base/login.html')

def logout_view(request):
    logout(request)
    messages.success(request, 'You have been logged out successfully')
    return redirect('login')

@login_required(login_url='login')
def cart(request):
    return render(request, 'base/cart.html', {
        'user': request.user
    })

@login_required(login_url='login')
def payment(request):
    return render(request, 'base/payment.html', {
        'user': request.user
    })

def TajPalace(request):
    return render(request, 'base/TajPalace.html')

def PunjabGrill(request):
    return render(request, 'base/PunjabGrill.html')

def DosaPlaza(request):
    return render(request, 'base/DosaPlaza.html')

def BiryaniHouse(request):
    return render(request, 'base/BiryaniHouse.html')

def MughalsKitchen(request):
    return render(request, 'base/MughalsKitchen.html')

def SarwanaBhawan(request):
    return render(request, 'base/SarwanaBhawan.html')

# def payment(request):
#     return render(request, 'base/payment.html')

# view changed
