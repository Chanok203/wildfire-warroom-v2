const table = $('#users-table').DataTable({
    language: {
        search: 'ค้นหา',
        searchPlaceholder: 'ชื่อผู้ใช้',
        info: 'แสดง _START_ ถึง _END_ จากทั้งหมด _TOTAL_',
        infoEmpty: 'ไม่พบข้อมูล',
    },
    processing: true,
    serverSide: false,
    columnDefs: [
        {
            targets: 2,
            render: function (data, type, row) {
                if (!data) return '-';
                const date = new Date(data);
                return date.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
            }
        }
    ]
});

$('.edit-btn-trigger').on('click', function() {
    const id = $(this).data('id');
    const username = $(this).data('username');

    const newAction = `/users/${id}/edit`;
    const form = $('#editForm')
    form.attr('action', newAction);
    form.find("#username").val(username);

    $('#edit-modal').modal('show');
    
});