from django.urls import path
from .views import UploadProductsView, ProductListView, ProductDetailView

urlpatterns = [
    path('upload/', UploadProductsView.as_view(), name='upload-products'),
    path('', ProductListView.as_view(), name='product-list'),
    path('<str:item_code>/', ProductDetailView.as_view(), name='product-detail'),
]
