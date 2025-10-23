import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatMessage } from 'src/app/common/ChatMessage';
import { Book } from 'src/app/common/Book';
import { BookService } from 'src/app/services/book.service';
import { PageService } from 'src/app/services/page.service';
import { Order } from 'src/app/common/Order';
import { OrderService } from 'src/app/services/order.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; // hoặc chỉ MatSelectModule cũng đủ


@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',

  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {


  listData!: MatTableDataSource<Order>;
  order!: Order[];
  bookLength!: number;
  columns: string[] = ['id', 'imageTour', 'nameTour', 'email', 'phone', 'amount', 'bookDate', 'status', 'view'];


  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pageService: PageService, private toastr: ToastrService, private bookService: BookService, private orderService: OrderService, private route: ActivatedRoute, private dialog: MatDialog) {
    route.params.subscribe(val => {
      this.ngOnInit();
    })
  }
  getStatus(row: Order): string {
    const now = new Date();
    const start = new Date(row.tour?.startDate || '');
    const end = new Date(start);
    end.setDate(end.getDate() + (3) - 1); // tính ngày kết thúc

    if (now < start) return 'Chưa diễn ra';
    else if (now >= start && now <= end) return 'Đang diễn ra';

    else return 'Đã kết thúc';
  }

  getStatusColor(row: Order): string {
    const status = this.getStatus(row);
    if (status === 'Chưa diễn ra') return 'orange';
    if (status === 'Đang diễn ra') return 'green';
    return 'red';
  }

  filterByStatus(status: string) {
    if (!status) {
      this.listData.data = this.order;
    } else {
      this.listData.data = this.order.filter(o => {
        const s = this.getStatus(o);
        if (status === 'upcoming') return s === 'Chưa diễn ra';
        if (status === 'ongoing') return s === 'Đang diễn ra';
        if (status === 'finished') return s === 'Đã kết thúc';
        return true;
      });
    }
  }

  ngOnInit(): void {
    this.getOrder();
  }

  getOrder() {
    this.orderService.getOrder().subscribe(data => {
      this.order = (data as Order[]).sort((a, b) => {
        // Chuyển sang timestamp để so sánh
        if (b.orderTime == null) {
          return -1;
        }
        return new Date(b.orderTime ?? '').getTime() - new Date(a.orderTime ?? '').getTime();
      });

      this.listData = new MatTableDataSource(this.order);
      this.bookLength = this.order.length;
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;

    }, error => {
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }
  search(event: any) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.orderService.getOrder().subscribe(data => {
      this.order = data as Order[];

      // Lọc theo tên tour
      this.order = this.order.filter(o => o.tour.name.toLowerCase().includes(filterValue));

      this.listData = new MatTableDataSource(this.order);
      this.bookLength = this.order.length;
      this.listData.sort = this.sort;
      this.listData.paginator = this.paginator;
    });
  }


  openDetail(order: Order) {
    this.dialog.open(BookDetailDialogInline, {
      width: '600px',
      data: order
    });
  }

  getEndDate(startDate: string | Date, duration: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + duration);
    return date.toLocaleDateString('vi-VN'); // hoặc định dạng bạn muốn
  }



}

/* 🧩 Inline dialog component */
@Component({
  selector: 'book-detail-dialog-inline',
  template: `
    <div
      style="
        padding: 0;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(145deg, #fdfbfb 0%, #ebedee 100%);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      "
    >
      <!-- Header ảnh lớn -->
      <div
        style="
          position: relative;
          height: 220px;
          background: #000;
          overflow: hidden;
        "
      >
        <img
          [src]="data.tour.image"
          alt="Tour"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.9;
            transition: transform 0.3s ease;
          "
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        />
        <div
          style="
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding: 16px;
          "
        >
          <h2
            style="
              color: #fff;
              font-weight: 600;
              font-size: 22px;
              text-align: center;
              margin: 0;
              letter-spacing: 0.5px;
            "
          >
            {{ data.tour.name }}
          </h2>
        </div>
      </div>

      <!-- Nội dung -->
      <mat-dialog-content
        class="mat-typography"
        style="
          padding: 24px 28px;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.75);
          border-top: 1px solid rgba(255,255,255,0.5);
        "
      >
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 15px;">
          <p><strong>Mã đặt chỗ: </strong> <span style="color:#616161;">#{{ data.orderId }}</span></p>
          <p><strong>Khách hàng: </strong> <span style="color:#424242;">{{ data.name }}</span></p>
          <p><strong>Email: </strong> <span style="color:#424242;">{{ data.email }}</span></p>
          <p><strong>SĐT: </strong> <span style="color:#424242;">{{ data.phone }}</span></p>
          <p><strong>Ngày khởi hành: </strong> 
            <span style="color:#1976d2;">{{ data.tour.startDate  }}</span>
          </p>
         <p><strong>Ngày kết thúc: </strong> 
  <span style="color:#1976d2;">{{ getEndDate(data.tour.startDate, 3) }}</span>
</p>

          <p><strong>Tổng tiền: </strong> 
            <span style="color:#d32f2f; font-weight:600;">{{ data.totalPrice | number }} đ</span>
          </p>
          <p style="grid-column: 1 / span 2;">
            <strong>Ghi chú: </strong> 
            <span style="color:#757575;">{{ data.note || 'Không có' }}</span>
          </p>
        </div>
      </mat-dialog-content>

      <!-- Footer -->
      <mat-dialog-actions
        align="center"
        style="
          padding: 16px 0 24px 0;
          display: flex;
          justify-content: center;
          background: transparent;
        "
      >
        <button
          mat-raised-button
          color="primary"
          (click)="dialogRef.close()"
          style="
            border-radius: 30px;
            padding: 6px 26px;
            font-weight: 500;
            letter-spacing: 0.5px;
            box-shadow: 0 3px 10px rgba(63,81,181,0.3);
            transition: all 0.3s ease;
          "
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform='translateY(0)'"
        >
          <mat-icon style="vertical-align: middle;">close</mat-icon>
          &nbsp;Đóng lại
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class BookDetailDialogInline {
  constructor(
    public dialogRef: MatDialogRef<BookDetailDialogInline>,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) { }

  getEndDate(startDate: string | Date, duration: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + duration);
    return date.toLocaleDateString('vi-VN');
  }
}
