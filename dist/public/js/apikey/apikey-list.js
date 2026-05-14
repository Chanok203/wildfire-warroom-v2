const form = $('#createForm');

const keyInput = form.find('#key');
const genKeyBtn = form.find('#genKeyBtn');

genKeyBtn.on('click', function () {
    const uuid = self.crypto.randomUUID();
    keyInput.val(uuid);
});

const table = $('#apikey-table').DataTable({
    language: {
        search: 'ค้นหา',
        searchPlaceholder: 'API Key',
        info: 'แสดง _START_ ถึง _END_ จากทั้งหมด _TOTAL_',
        infoEmpty: 'ไม่พบข้อมูล',
    },
    processing: true,
    serverSide: false,
    columnDefs: [
        {
            targets: 3,
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