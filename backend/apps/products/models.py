from django.db import models


class Product(models.Model):
    item_code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    name = models.TextField()
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    hsn = models.CharField(max_length=20)
    qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='Active')
    show_online = models.BooleanField(default=False)
    barcode_image = models.ImageField(upload_to='barcodes/', blank=True)
    qr_image = models.ImageField(upload_to='qrcodes/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['item_code']

    def __str__(self):
        return f"{self.item_code} - {self.name}"
