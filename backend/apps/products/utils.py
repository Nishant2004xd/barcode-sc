import barcode
from barcode.writer import ImageWriter
import qrcode
from io import BytesIO
from django.core.files import File
from django.conf import settings


def generate_barcode_image(item_code):
    """Generate Code128 barcode PNG for the item code."""
    code128 = barcode.get('code128', item_code, writer=ImageWriter())
    buffer = BytesIO()
    code128.write(buffer, options={'write_text': True, 'module_height': 15, 'font_size': 10})
    buffer.seek(0)
    return File(buffer, name=f'{item_code}_barcode.png')


def generate_qr_image(item_code):
    """Generate QR code PNG that encodes the product detail URL."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    url = f"{frontend_url}/product/{item_code}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return File(buffer, name=f'{item_code}_qr.png')


def parse_excel(file):
    """Parse uploaded Excel and return list of product dicts."""
    import openpyxl
    wb = openpyxl.load_workbook(file)
    ws = wb.active
    products = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row[1]:  # skip empty rows (item_code column)
            continue
        sr_no, item_code, category, brand, name, mrp, selling_price, hsn, qty, status, show_online = (
            list(row) + [None] * 11
        )[:11]
        def to_float(val):
            if val is None:
                return 0.0
            return float(str(val).replace(',', '').strip())

        products.append({
            'item_code': str(item_code).strip(),
            'category': str(category or '').strip(),
            'brand': str(brand or '').strip(),
            'name': str(name or '').strip(),
            'mrp': to_float(mrp),
            'selling_price': to_float(selling_price),
            'hsn': str(hsn or '').strip(),
            'qty': to_float(qty),
            'status': str(status or 'Active').strip(),
            'show_online': str(show_online or '').strip().lower() == 'yes',
        })
    return products
