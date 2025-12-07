

import { Language } from '../types';

export type TranslationKey =
  | 'invoice_editor'
  | 'lease_editor'
  | 'preview'
  | 'download_pdf'
  | 'download_file'
  | 'processing'
  | 'reset'
  | 'ai_import'
  | 'switch_invoice'
  | 'switch_lease'
  | 'switch_chat'
  | 'doc_invoice'
  | 'doc_lease'
  | 'ai_modal_title'
  | 'ai_placeholder'
  | 'ai_error'
  | 'ai_missing_key'
  | 'cancel'
  | 'parse'
  | 'analyzing'
  // Wizard
  | 'step_counter'
  | 'btn_back'
  | 'btn_next'
  // Invoice Form
  | 'step_general'
  | 'step_seller'
  | 'step_buyer'
  | 'step_goods'
  | 'type_person'
  | 'type_company'
  | 'lbl_invoice_no'
  | 'lbl_date'
  | 'lbl_time'
  | 'lbl_vat'
  | 'lbl_name_fio'
  | 'lbl_inn'
  | 'lbl_kpp'
  | 'lbl_address'
  | 'lbl_bank_details'
  | 'lbl_bank_name'
  | 'lbl_bik'
  | 'lbl_corr_account'
  | 'lbl_account_number'
  | 'lbl_signatories'
  | 'lbl_director'
  | 'lbl_accountant'
  | 'lbl_buyer_name'
  | 'lbl_service_list'
  | 'lbl_item_name'
  | 'lbl_qty'
  | 'lbl_price'
  | 'msg_no_items'
  // Lease Form
  | 'step_vehicle'
  | 'step_schedule'
  | 'step_financials'
  | 'step_parties'
  | 'step_signatures'
  | 'lbl_res_id'
  | 'lbl_template_id'
  | 'lbl_optional'
  | 'lbl_source'
  | 'lbl_created'
  | 'grp_vehicle'
  | 'lbl_model'
  | 'lbl_details'
  | 'lbl_plate'
  | 'grp_pickup'
  | 'grp_return'
  | 'lbl_reg_days'
  | 'lbl_reg_price'
  | 'lbl_seas_days'
  | 'lbl_seas_price'
  | 'grp_extra'
  | 'lbl_deposit'
  | 'lbl_total_paid'
  | 'grp_owner'
  | 'lbl_surname'
  | 'lbl_contact'
  | 'grp_renter'
  | 'lbl_passport'
  | 'lbl_terms'
  | 'lbl_fee'
  | 'lbl_sign_owner'
  | 'lbl_sign_renter'
  | 'btn_clear'
  | 'btn_save_sign'
  | 'msg_sign_saved'
  | 'lbl_sign_here'
  // Login
  | 'login_title'
  | 'login_desc'
  | 'lbl_username'
  | 'lbl_password'
  | 'btn_login'
  // Preview
  | 'preview_loading'
  | 'preview_not_found'
  | 'preview_lease_title'
  | 'server_preview'
  | 'generating_blob'
  | 'mobile_editor_tab'
  | 'mobile_preview_tab'
  | 'open_shareable_link'
  // Lease Preview HTML
  | 'lp_lease_agreement'
  | 'lp_reservation_id'
  | 'lp_source'
  | 'lp_created_on'
  | 'lp_pickup'
  | 'lp_default_pickup'
  | 'lp_return'
  | 'lp_default_return'
  | 'lp_rental_cost'
  | 'lp_regular_price'
  | 'lp_season_price'
  | 'lp_days'
  | 'lp_extra_options'
  | 'lp_none'
  | 'lp_deposit'
  | 'lp_return_at_end'
  | 'lp_total_price'
  | 'lp_paid_separately'
  | 'lp_owner'
  | 'lp_lessor'
  | 'lp_date_signature'
  | 'lp_rider'
  | 'lp_tenant'
  | 'lp_passport'
  | 'lp_pickup_fee'
  | 'lp_return_fee'
  // Chat General
  | 'chat_search'
  | 'chat_type_message'
  | 'chat_active'
  | 'chat_view_profile'
  | 'chat_search_history'
  | 'btn_confirm'
  | 'btn_reject'
  | 'btn_delete'
  | 'btn_archive'
  | 'btn_call'
  | 'btn_download_lease'
  | 'btn_download_invoice'
  | 'btn_collect'
  | 'btn_complete'
  // Chat Sidebar
  | 'menu_mark_read'
  | 'menu_mark_unread'
  | 'confirm_delete_chat'
  | 'no_active_chats'
  | 'loading_chats'
  | 'lbl_sort_by'
  | 'lbl_filter_status'
  | 'sort_date'
  | 'sort_name'
  | 'filter_all'
  // Chat Window
  | 'timeline_title'
  | 'no_dates'
  | 'expires_in'
  | 'left_to_action'
  // Chat Layout
  | 'loading_conversation'
  | 'select_conversation'
  | 'select_conversation_desc'
  // Right Panel
  | 'rp_details'
  | 'rp_map'
  | 'rp_profile'
  | 'rp_pickup_location'
  | 'rp_map_placeholder'
  | 'rp_leases'
  | 'rp_status'
  | 'rp_active'
  | 'rp_rider_details'
  | 'rp_full_name'
  | 'rp_enter_name'
  | 'rp_contact_info'
  | 'rp_phone_email'
  | 'rp_passport_id'
  | 'rp_passport_number'
  | 'rp_owner_details'
  | 'rp_rent_service_name'
  | 'rp_shown_on_contract'
  | 'rp_business_address'
  | 'rp_full_address'
  // Statuses
  | 'status_collected'
  | 'status_completed'
  | 'status_overdue'
  | 'status_confirmed'
  | 'status_pending'
  | 'status_wait_owner'
  | 'status_wait_rider'
  | 'status_rejected'
  | 'status_maintenance'
  | 'status_cancelled'
  | 'status_conflict'
  | 'status_no_response'
  // Time
  | 'time_ended'
  | 'time_overdue_by'
  | 'time_ending_now'
  | 'time_ends_in'
  | 'time_days_left';

const dictionary: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    invoice_editor: 'Редактор счета',
    lease_editor: 'Редактор договора',
    preview: 'Предпросмотр',
    download_pdf: 'Скачать PDF',
    download_file: 'Скачать Файл',
    processing: 'Обработка...',
    reset: 'Сброс',
    ai_import: 'AI Импорт',
    switch_invoice: 'Счет (РФ)',
    switch_lease: 'Аренда',
    switch_chat: 'Чат',
    doc_invoice: 'A4 PDF • Стандарт РФ',
    doc_lease: 'A4 PDF • Договор аренды',
    ai_modal_title: 'Импорт данных через AI',
    ai_placeholder: 'Вставьте текст счета или детали аренды...',
    ai_error: 'Не удалось распознать данные.',
    ai_missing_key: 'API ключ не найден.',
    cancel: 'Отмена',
    parse: 'Распознать',
    analyzing: 'Анализ...',
    
    // Wizard
    step_counter: 'Шаг {current} из {total}',
    btn_back: 'Назад',
    btn_next: 'Далее',

    // Invoice Form
    step_general: 'Общая информация',
    step_seller: 'Продавец (Исполнитель)',
    step_buyer: 'Покупатель (Заказчик)',
    step_goods: 'Товары и Услуги',
    type_person: 'Самозанятый / ИП',
    type_company: 'Организация',
    lbl_invoice_no: '№ Счета',
    lbl_date: 'Дата',
    lbl_time: 'Время',
    lbl_vat: 'НДС',
    lbl_name_fio: 'Название / ФИО',
    lbl_inn: 'ИНН',
    lbl_kpp: 'КПП',
    lbl_address: 'Юр. Адрес',
    lbl_bank_details: 'БАНКОВСКИЕ РЕКВИЗИТЫ',
    lbl_bank_name: 'Название Банка',
    lbl_bik: 'БИК',
    lbl_corr_account: 'Корр. счет',
    lbl_account_number: 'Расчетный счет',
    lbl_signatories: 'ПОДПИСАНТЫ',
    lbl_director: 'Руководитель',
    lbl_accountant: 'Бухгалтер',
    lbl_buyer_name: 'Название компании',
    lbl_service_list: 'Список услуг',
    lbl_item_name: 'Наименование',
    lbl_qty: 'Кол-во',
    lbl_price: 'Цена (руб)',
    msg_no_items: 'Нет товаров',

    // Lease Form
    step_vehicle: 'Авто и Инфо',
    step_schedule: 'Расписание',
    step_financials: 'Финансы',
    step_parties: 'Стороны и Условия',
    step_signatures: 'Подписи',
    lbl_res_id: 'ID Брони',
    lbl_template_id: 'ID Шаблона',
    lbl_optional: 'Опционально',
    lbl_source: 'Источник',
    lbl_created: 'Создано',
    grp_vehicle: 'ДЕТАЛИ ТС',
    lbl_model: 'Модель',
    lbl_details: 'Детали (Тип, Цвет)',
    lbl_plate: 'Госномер',
    grp_pickup: 'ВЫДАЧА (СТАРТ)',
    grp_return: 'ВОЗВРАТ (КОНЕЦ)',
    lbl_reg_days: 'Дни (Обыч)',
    lbl_reg_price: 'Цена (Обыч)',
    lbl_seas_days: 'Дни (Сезон)',
    lbl_seas_price: 'Цена (Сезон)',
    grp_extra: 'ДОП. ОПЦИИ',
    lbl_deposit: 'Депозит',
    lbl_total_paid: 'ИТОГО ОПЛАЧЕНО',
    grp_owner: 'ВЛАДЕЛЕЦ (АРЕНДОДАТЕЛЬ)',
    lbl_surname: 'Фамилия / Название',
    lbl_contact: 'Контакты',
    grp_renter: 'РАЙДЕР (АРЕНДАТОР)',
    lbl_passport: 'Паспорт',
    lbl_terms: 'Юридические условия',
    lbl_fee: 'Сбор (Fee)',
    lbl_sign_owner: 'Подпись Владельца',
    lbl_sign_renter: 'Подпись Райдера',
    btn_clear: 'Очистить',
    btn_save_sign: 'Сохранить подпись',
    msg_sign_saved: 'Подпись сохранена',
    lbl_sign_here: 'Подпишите здесь',

    // Login
    login_title: 'Ограниченный доступ',
    login_desc: 'Пожалуйста, войдите для просмотра документа.',
    lbl_username: 'Имя пользователя / Email',
    lbl_password: 'Пароль',
    btn_login: 'Войти',

    // Preview
    preview_loading: 'Загрузка документа...',
    preview_not_found: 'Документ не найден',
    preview_lease_title: 'Договор Аренды',
    server_preview: 'Предпросмотр (Сервер)',
    generating_blob: 'Генерация PDF...',
    mobile_editor_tab: 'Редактор',
    mobile_preview_tab: 'Просмотр',
    open_shareable_link: 'Открыть ссылку',

    // Lease Preview HTML
    lp_lease_agreement: 'Договор аренды',
    lp_reservation_id: 'ID Бронирования',
    lp_source: 'Источник',
    lp_created_on: 'Создано',
    lp_pickup: 'Выдача',
    lp_default_pickup: 'Стандартная выдача',
    lp_return: 'Возврат',
    lp_default_return: 'Стандартный возврат',
    lp_rental_cost: 'Стоимость Аренды',
    lp_regular_price: 'Обычная цена',
    lp_season_price: 'Сезонная цена',
    lp_days: 'дн.',
    lp_extra_options: 'Доп. опции',
    lp_none: 'Нет',
    lp_deposit: 'Депозит',
    lp_return_at_end: 'Возврат в конце аренды',
    lp_total_price: 'Итоговая цена',
    lp_paid_separately: 'Оплачивается отдельно',
    lp_owner: 'Владелец',
    lp_lessor: 'Арендодатель',
    lp_date_signature: 'Дата, подпись',
    lp_rider: 'Райдер',
    lp_tenant: 'Арендатор',
    lp_passport: 'Паспорт',
    lp_pickup_fee: 'Сбор за выдачу',
    lp_return_fee: 'Сбор за возврат',
    
    // Chat General
    chat_search: 'Поиск чатов',
    chat_type_message: 'Введите сообщение...',
    chat_active: 'Активен',
    chat_view_profile: 'Профиль',
    chat_search_history: 'Поиск в истории',
    btn_confirm: 'Подтвердить',
    btn_reject: 'Отклонить',
    btn_delete: 'Удалить',
    btn_archive: 'Архив',
    btn_call: 'Позвонить',
    btn_download_lease: 'Скачать договор',
    btn_download_invoice: 'Скачать счет',
    btn_collect: 'Выдать',
    btn_complete: 'Завершить',

    // Chat Sidebar
    menu_mark_read: 'Прочитано',
    menu_mark_unread: 'Непрочитано',
    confirm_delete_chat: 'Вы уверены, что хотите удалить этот чат? Это действие необратимо.',
    no_active_chats: 'Нет активных чатов.',
    loading_chats: 'Загрузка чатов...',
    lbl_sort_by: 'Сортировка',
    lbl_filter_status: 'Статус',
    sort_date: 'Дата',
    sort_name: 'Имя',
    filter_all: 'Все',

    // Chat Window
    timeline_title: 'Таймлайн',
    no_dates: 'Даты не выбраны',
    expires_in: 'Истекает через',
    left_to_action: 'на решение',

    // Chat Layout
    loading_conversation: 'Загрузка переписки...',
    select_conversation: 'Выберите чат',
    select_conversation_desc: 'Выберите чат из списка, чтобы увидеть детали, управлять договорами и общаться с арендаторами.',

    // Right Panel
    rp_details: 'Детали',
    rp_map: 'Карта',
    rp_profile: 'Профиль',
    rp_pickup_location: 'Место подачи',
    rp_map_placeholder: 'Карта',
    rp_leases: 'Аренды',
    rp_status: 'Статус',
    rp_active: 'Активен',
    rp_rider_details: 'Данные Райдера',
    rp_full_name: 'ФИО',
    rp_enter_name: 'Введите имя',
    rp_contact_info: 'Контакты',
    rp_phone_email: 'Телефон или Email',
    rp_passport_id: 'Паспорт / ID',
    rp_passport_number: 'Номер паспорта',
    rp_owner_details: 'Данные Владельца',
    rp_rent_service_name: 'Название проката',
    rp_shown_on_contract: 'Для договора',
    rp_business_address: 'Адрес офиса',
    rp_full_address: 'Полный адрес',

    // Statuses
    status_collected: 'Выдано',
    status_completed: 'Завершено',
    status_overdue: 'Просрочено',
    status_confirmed: 'Подтверждено',
    status_pending: 'Ожидание',
    status_wait_owner: 'Ждет Владельца',
    status_wait_rider: 'Ждет Райдера',
    status_rejected: 'Отклонено',
    status_maintenance: 'Обслуживание',
    status_cancelled: 'Отменено',
    status_conflict: 'Конфликт',
    status_no_response: 'Нет ответа',

    // Time
    time_ended: 'Завершено',
    time_overdue_by: 'Просрочка',
    time_ending_now: 'Завершается сейчас',
    time_ends_in: 'До конца',
    time_days_left: 'дн. осталось'
  },
  en: {
    invoice_editor: 'Invoice Editor',
    lease_editor: 'Lease Editor',
    preview: 'Preview',
    download_pdf: 'Download PDF',
    download_file: 'Download File',
    processing: 'Processing...',
    reset: 'Reset',
    ai_import: 'AI Import',
    switch_invoice: 'Invoice (RU)',
    switch_lease: 'Lease',
    switch_chat: 'Chat',
    doc_invoice: 'A4 PDF • Russian Standard',
    doc_lease: 'A4 PDF • Rental Agreement',
    ai_modal_title: 'AI Data Import',
    ai_placeholder: 'Paste invoice text or lease details here...',
    ai_error: 'Could not parse data.',
    ai_missing_key: 'API Key is missing.',
    cancel: 'Cancel',
    parse: 'Parse',
    analyzing: 'Analyzing...',

    // Wizard
    step_counter: 'Step {current} of {total}',
    btn_back: 'Back',
    btn_next: 'Next',

    // Invoice Form
    step_general: 'General Info',
    step_seller: 'Seller (Provider)',
    step_buyer: 'Buyer (Customer)',
    step_goods: 'Items & Services',
    type_person: 'Self-Employed / IP',
    type_company: 'Company',
    lbl_invoice_no: 'Invoice #',
    lbl_date: 'Date',
    lbl_time: 'Time',
    lbl_vat: 'VAT',
    lbl_name_fio: 'Name / Full Name',
    lbl_inn: 'INN (Tax ID)',
    lbl_kpp: 'KPP',
    lbl_address: 'Legal Address',
    lbl_bank_details: 'BANK DETAILS',
    lbl_bank_name: 'Bank Name',
    lbl_bik: 'BIC',
    lbl_corr_account: 'Corr. Account',
    lbl_account_number: 'Account Number',
    lbl_signatories: 'SIGNATORIES',
    lbl_director: 'Director',
    lbl_accountant: 'Accountant',
    lbl_buyer_name: 'Company Name',
    lbl_service_list: 'List of Services',
    lbl_item_name: 'Name',
    lbl_qty: 'Qty',
    lbl_price: 'Price (RUB)',
    msg_no_items: 'No items',

    // Lease Form
    step_vehicle: 'Vehicle & Info',
    step_schedule: 'Schedule',
    step_financials: 'Financials',
    step_parties: 'Parties & Terms',
    step_signatures: 'Signatures',
    lbl_res_id: 'Res ID',
    lbl_template_id: 'Template ID',
    lbl_optional: 'Optional',
    lbl_source: 'Source',
    lbl_created: 'Created On',
    grp_vehicle: 'VEHICLE DETAILS',
    lbl_model: 'Model Name',
    lbl_details: 'Details (Type, Color)',
    lbl_plate: 'Plate Number',
    grp_pickup: 'PICK-UP (START)',
    grp_return: 'RETURN (END)',
    lbl_reg_days: 'Regular Days',
    lbl_reg_price: 'Regular Price',
    lbl_seas_days: 'Season Days',
    lbl_seas_price: 'Season Price',
    grp_extra: 'EXTRA OPTIONS',
    lbl_deposit: 'Deposit Amount',
    lbl_total_paid: 'TOTAL PAID',
    grp_owner: 'OWNER (LESSOR)',
    lbl_surname: 'Surname / Name',
    lbl_contact: 'Contact',
    grp_renter: 'RIDER (TENANT)',
    lbl_passport: 'Passport No',
    lbl_terms: 'Legal Terms',
    lbl_fee: 'Extra Fee',
    lbl_sign_owner: 'Owner Signature',
    lbl_sign_renter: 'Rider Signature',
    btn_clear: 'Clear',
    btn_save_sign: 'Save Signature',
    msg_sign_saved: 'Signature Saved',
    lbl_sign_here: 'Sign Here',

    // Login
    login_title: 'Restricted Access',
    login_desc: 'Please log in to view this document.',
    lbl_username: 'Username / Email',
    lbl_password: 'Password',
    btn_login: 'Log In',

    // Preview
    preview_loading: 'Loading Document...',
    preview_not_found: 'Document not found',
    preview_lease_title: 'Lease Agreement Preview',
    server_preview: 'Server Preview',
    generating_blob: 'Generating PDF...',
    mobile_editor_tab: 'Editor',
    mobile_preview_tab: 'Preview',
    open_shareable_link: 'Open Shareable Link',

    // Lease Preview HTML
    lp_lease_agreement: 'Lease agreement',
    lp_reservation_id: 'Reservation ID',
    lp_source: 'Source',
    lp_created_on: 'Created on',
    lp_pickup: 'Pick-up',
    lp_default_pickup: 'Default pick-up',
    lp_return: 'Return',
    lp_default_return: 'Default return',
    lp_rental_cost: 'Rental Cost',
    lp_regular_price: 'Regular price',
    lp_season_price: 'Season price',
    lp_days: 'days',
    lp_extra_options: 'Extra options',
    lp_none: 'None',
    lp_deposit: 'Deposit',
    lp_return_at_end: 'Return at the end of the rental period',
    lp_total_price: 'Total price',
    lp_paid_separately: 'Paid separately',
    lp_owner: 'Owner',
    lp_lessor: 'Lessor',
    lp_date_signature: 'Date, signature',
    lp_rider: 'Rider',
    lp_tenant: 'Tenant',
    lp_passport: 'Passport',
    lp_pickup_fee: 'Pick-up fee',
    lp_return_fee: 'Return fee',

    // Chat General
    chat_search: 'Search chats',
    chat_type_message: 'Type a message...',
    chat_active: 'Active now',
    chat_view_profile: 'View profile',
    chat_search_history: 'Search history',
    btn_confirm: 'Confirm',
    btn_reject: 'Reject',
    btn_delete: 'Delete',
    btn_archive: 'Archive',
    btn_call: 'Call',
    btn_download_lease: 'Download Lease',
    btn_download_invoice: 'Download Invoice',
    btn_collect: 'Hand Over',
    btn_complete: 'Complete',

    // Chat Sidebar
    menu_mark_read: 'Mark as Read',
    menu_mark_unread: 'Mark as Unread',
    confirm_delete_chat: 'Are you sure you want to delete this conversation?',
    no_active_chats: 'No active chats found.',
    loading_chats: 'Loading chats...',
    lbl_sort_by: 'Sort By',
    lbl_filter_status: 'Filter Status',
    sort_date: 'Date',
    sort_name: 'Name',
    filter_all: 'All',

    // Chat Window
    timeline_title: 'Timeline',
    no_dates: 'No dates set',
    expires_in: 'Expires in',
    left_to_action: 'left to action',

    // Chat Layout
    loading_conversation: 'Loading conversation...',
    select_conversation: 'Select a Conversation',
    select_conversation_desc: 'Choose a chat from the sidebar to view details, manage lease agreements, and communicate with renters.',

    // Right Panel
    rp_details: 'Details',
    rp_map: 'Map',
    rp_profile: 'Profile',
    rp_pickup_location: 'Pickup Location',
    rp_map_placeholder: 'Map Placeholder',
    rp_leases: 'Leases',
    rp_status: 'Status',
    rp_active: 'Active',
    rp_rider_details: 'Rider Details',
    rp_full_name: 'Full Name',
    rp_enter_name: 'Enter Name',
    rp_contact_info: 'Contact Info',
    rp_phone_email: 'Phone or Email',
    rp_passport_id: 'Passport / ID',
    rp_passport_number: 'Passport Number',
    rp_owner_details: 'Owner Details',
    rp_rent_service_name: 'Rent Service Name',
    rp_shown_on_contract: 'Shown on contract',
    rp_business_address: 'Business Address',
    rp_full_address: 'Full Address',

    // Statuses
    status_collected: 'Collected',
    status_completed: 'Completed',
    status_overdue: 'Overdue',
    status_confirmed: 'Confirmed',
    status_pending: 'Pending',
    status_wait_owner: 'Wait Owner',
    status_wait_rider: 'Wait Rider',
    status_rejected: 'Rejected',
    status_maintenance: 'Maintenance',
    status_cancelled: 'Cancelled',
    status_conflict: 'Conflict',
    status_no_response: 'No Response',

    // Time
    time_ended: 'Ended',
    time_overdue_by: 'Overdue by',
    time_ending_now: 'Ending now',
    time_ends_in: 'Ends in',
    time_days_left: 'days left'
  },
  th: {
    invoice_editor: 'ตัวแก้ไขใบแจ้งหนี้',
    lease_editor: 'ตัวแก้ไขสัญญาเช่า',
    preview: 'ดูตัวอย่าง',
    download_pdf: 'ดาวน์โหลด PDF',
    download_file: 'ดาวน์โหลดไฟล์',
    processing: 'กำลังดำเนินการ...',
    reset: 'รีเซ็ต',
    ai_import: 'นำเข้า AI',
    switch_invoice: 'ใบแจ้งหนี้ (RU)',
    switch_lease: 'สัญญาเช่า',
    switch_chat: 'แชท',
    doc_invoice: 'A4 PDF • มาตรฐานรัสเซีย',
    doc_lease: 'A4 PDF • สัญญาเช่า',
    ai_modal_title: 'นำเข้าข้อมูล AI',
    ai_placeholder: 'วางข้อความใบแจ้งหนี้หรือรายละเอียดการเช่าที่นี่...',
    ai_error: 'ไม่สามารถแยกวิเคราะห์ข้อมูลได้',
    ai_missing_key: 'ไม่มีคีย์ API',
    cancel: 'ยกเลิก',
    parse: 'แยกวิเคราะห์',
    analyzing: 'กำลังวิเคราะห์...',
    step_counter: 'ขั้นตอน {current} จาก {total}',
    btn_back: 'ย้อนกลับ',
    btn_next: 'ถัดไป',
    step_general: 'ข้อมูลทั่วไป',
    step_seller: 'ผู้ขาย (ผู้ให้บริการ)',
    step_buyer: 'ผู้ซื้อ (ลูกค้า)',
    step_goods: 'รายการและบริการ',
    type_person: 'อาชีพอิสระ / IP',
    type_company: 'บริษัท',
    lbl_invoice_no: 'ใบแจ้งหนี้ #',
    lbl_date: 'วันที่',
    lbl_time: 'เวลา',
    lbl_vat: 'ภาษีมูลค่าเพิ่ม',
    lbl_name_fio: 'ชื่อ / ชื่อเต็ม',
    lbl_inn: 'เลขประจำตัวผู้เสียภาษี',
    lbl_kpp: 'KPP',
    lbl_address: 'ที่อยู่ตามกฎหมาย',
    lbl_bank_details: 'รายละเอียดธนาคาร',
    lbl_bank_name: 'ชื่อธนาคาร',
    lbl_bik: 'BIC',
    lbl_corr_account: 'บัญชี Corr.',
    lbl_account_number: 'หมายเลขบัญชี',
    lbl_signatories: 'ผู้ลงนาม',
    lbl_director: 'กรรมการ',
    lbl_accountant: 'นักบัญชี',
    lbl_buyer_name: 'ชื่อบริษัท',
    lbl_service_list: 'รายการบริการ',
    lbl_item_name: 'ชื่อ',
    lbl_qty: 'จำนวน',
    lbl_price: 'ราคา (RUB)',
    msg_no_items: 'ไม่มีรายการ',
    step_vehicle: 'ยานพาหนะและข้อมูล',
    step_schedule: 'กำหนดการ',
    step_financials: 'การเงิน',
    step_parties: 'คู่สัญญาและเงื่อนไข',
    step_signatures: 'ลายเซ็น',
    lbl_res_id: 'รหัสการจอง',
    lbl_template_id: 'รหัสเทมเพลต',
    lbl_optional: 'ไม่บังคับ',
    lbl_source: 'ที่มา',
    lbl_created: 'สร้างเมื่อ',
    grp_vehicle: 'รายละเอียดรถ',
    lbl_model: 'ชื่อรุ่น',
    lbl_details: 'รายละเอียด (ประเภท, สี)',
    lbl_plate: 'ทะเบียนรถ',
    grp_pickup: 'รับรถ (เริ่ม)',
    grp_return: 'คืนรถ (สิ้นสุด)',
    lbl_reg_days: 'วันปกติ',
    lbl_reg_price: 'ราคาปกติ',
    lbl_seas_days: 'วันฤดูกาล',
    lbl_seas_price: 'ราคาฤดูกาล',
    grp_extra: 'ตัวเลือกเสริม',
    lbl_deposit: 'จำนวนเงินมัดจำ',
    lbl_total_paid: 'ยอดชำระรวม',
    grp_owner: 'เจ้าของ (ผู้ให้เช่า)',
    lbl_surname: 'นามสกุล / ชื่อ',
    lbl_contact: 'ติดต่อ',
    grp_renter: 'ผู้เช่า',
    lbl_passport: 'เลขที่หนังสือเดินทาง',
    lbl_terms: 'เงื่อนไขทางกฎหมาย',
    lbl_fee: 'ค่าธรรมเนียมพิเศษ',
    lbl_sign_owner: 'ลายเซ็นเจ้าของ',
    lbl_sign_renter: 'ลายเซ็นผู้เช่า',
    btn_clear: 'ล้าง',
    btn_save_sign: 'บันทึกลายเซ็น',
    msg_sign_saved: 'บันทึกลายเซ็นแล้ว',
    lbl_sign_here: 'เซ็นที่นี่',
    login_title: 'จำกัดการเข้าถึง',
    login_desc: 'กรุณาเข้าสู่ระบบเพื่อดูเอกสารนี้',
    lbl_username: 'ชื่อผู้ใช้ / อีเมล',
    lbl_password: 'รหัสผ่าน',
    btn_login: 'เข้าสู่ระบบ',
    preview_loading: 'กำลังโหลดเอกสาร...',
    preview_not_found: 'ไม่พบเอกสาร',
    preview_lease_title: 'ดูตัวอย่างสัญญาเช่า',
    server_preview: 'ดูตัวอย่าง (เซิร์ฟเวอร์)',
    generating_blob: 'กำลังสร้าง PDF...',
    mobile_editor_tab: 'ตัวแก้ไข',
    mobile_preview_tab: 'ดูตัวอย่าง',
    open_shareable_link: 'เปิดลิงก์ที่แชร์ได้',
    lp_lease_agreement: 'สัญญาเช่า',
    lp_reservation_id: 'รหัสการจอง',
    lp_source: 'ที่มา',
    lp_created_on: 'สร้างเมื่อ',
    lp_pickup: 'รับรถ',
    lp_default_pickup: 'เวลารับรถมาตรฐาน',
    lp_return: 'คืนรถ',
    lp_default_return: 'เวลาคืนรถมาตรฐาน',
    lp_rental_cost: 'ค่าเช่า',
    lp_regular_price: 'ราคาปกติ',
    lp_season_price: 'ราคาฤดูกาล',
    lp_days: 'วัน',
    lp_extra_options: 'ตัวเลือกเสริม',
    lp_none: 'ไม่มี',
    lp_deposit: 'เงินมัดจำ',
    lp_return_at_end: 'คืนเมื่อสิ้นสุดระยะเวลาเช่า',
    lp_total_price: 'ราคารวม',
    lp_paid_separately: 'ชำระแยกต่างหาก',
    lp_owner: 'เจ้าของ',
    lp_lessor: 'ผู้ให้เช่า',
    lp_date_signature: 'วันที่, ลายเซ็น',
    lp_rider: 'ผู้เช่า',
    lp_tenant: 'ผู้เช่า',
    lp_passport: 'หนังสือเดินทาง',
    lp_pickup_fee: 'ค่าธรรมเนียมรับรถ',
    lp_return_fee: 'ค่าธรรมเนียมคืนรถ',
    chat_search: 'ค้นหาแชท',
    chat_type_message: 'พิมพ์ข้อความ...',
    chat_active: 'ใช้งานอยู่',
    chat_view_profile: 'ดูโปรไฟล์',
    chat_search_history: 'ค้นหาประวัติ',
    btn_confirm: 'ยืนยัน',
    btn_reject: 'ปฏิเสธ',
    btn_delete: 'ลบ',
    btn_archive: 'เก็บถาวร',
    btn_call: 'โทร',
    btn_download_lease: 'ดาวน์โหลดสัญญา',
    btn_download_invoice: 'ดาวน์โหลดใบแจ้งหนี้',
    btn_collect: 'ส่งมอบรถ',
    btn_complete: 'เสร็จสิ้น',
    menu_mark_read: 'ทำเครื่องหมายว่าอ่านแล้ว',
    menu_mark_unread: 'ทำเครื่องหมายว่ายังไม่อ่าน',
    confirm_delete_chat: 'คุณแน่ใจหรือไม่ว่าต้องการลบการสนทนานี้?',
    no_active_chats: 'ไม่พบแชทที่ใช้งานอยู่',
    loading_chats: 'กำลังโหลดแชท...',
    lbl_sort_by: 'เรียงตาม',
    lbl_filter_status: 'กรองสถานะ',
    sort_date: 'วันที่',
    sort_name: 'ชื่อ',
    filter_all: 'ทั้งหมด',
    timeline_title: 'ไทม์ไลน์',
    no_dates: 'ไม่ได้กำหนดวันที่',
    expires_in: 'หมดอายุใน',
    left_to_action: 'เหลือเวลาดำเนินการ',
    loading_conversation: 'กำลังโหลดการสนทนา...',
    select_conversation: 'เลือกการสนทนา',
    select_conversation_desc: 'เลือกแชทจากแถบด้านข้างเพื่อดูรายละเอียด จัดการสัญญาเช่า และสื่อสารกับผู้เช่า',
    rp_details: 'รายละเอียด',
    rp_map: 'แผนที่',
    rp_profile: 'โปรไฟล์',
    rp_pickup_location: 'สถานที่รับรถ',
    rp_map_placeholder: 'แผนที่',
    rp_leases: 'การเช่า',
    rp_status: 'สถานะ',
    rp_active: 'ใช้งานอยู่',
    rp_rider_details: 'รายละเอียดผู้เช่า',
    rp_full_name: 'ชื่อเต็ม',
    rp_enter_name: 'ใส่ชื่อ',
    rp_contact_info: 'ข้อมูลติดต่อ',
    rp_phone_email: 'โทรศัพท์หรืออีเมล',
    rp_passport_id: 'หนังสือเดินทาง / ID',
    rp_passport_number: 'เลขที่หนังสือเดินทาง',
    rp_owner_details: 'รายละเอียดเจ้าของ',
    rp_rent_service_name: 'ชื่อบริการเช่า',
    rp_shown_on_contract: 'แสดงในสัญญา',
    rp_business_address: 'ที่อยู่ธุรกิจ',
    rp_full_address: 'ที่อยู่เต็ม',
    status_collected: 'รับรถแล้ว',
    status_completed: 'เสร็จสมบูรณ์',
    status_overdue: 'เกินกำหนด',
    status_confirmed: 'ยืนยันแล้ว',
    status_pending: 'รอดำเนินการ',
    status_wait_owner: 'รอเจ้าของ',
    status_wait_rider: 'รอผู้เช่า',
    status_rejected: 'ปฏิเสธ',
    status_maintenance: 'ซ่อมบำรุง',
    status_cancelled: 'ยกเลิก',
    status_conflict: 'ขัดแย้ง',
    status_no_response: 'ไม่มีการตอบรับ',
    time_ended: 'สิ้นสุด',
    time_overdue_by: 'เกินกำหนด',
    time_ending_now: 'กำลังสิ้นสุด',
    time_ends_in: 'สิ้นสุดใน',
    time_days_left: 'วันเหลือ'
  },
  vi: {
    invoice_editor: 'Trình chỉnh sửa hóa đơn',
    lease_editor: 'Trình chỉnh sửa hợp đồng thuê',
    preview: 'Xem trước',
    download_pdf: 'Tải PDF',
    download_file: 'Tải tệp',
    processing: 'Đang xử lý...',
    reset: 'Đặt lại',
    ai_import: 'Nhập AI',
    switch_invoice: 'Hóa đơn (RU)',
    switch_lease: 'Hợp đồng thuê',
    switch_chat: 'Trò chuyện',
    doc_invoice: 'A4 PDF • Tiêu chuẩn Nga',
    doc_lease: 'A4 PDF • Hợp đồng cho thuê',
    ai_modal_title: 'Nhập dữ liệu AI',
    ai_placeholder: 'Dán văn bản hóa đơn hoặc chi tiết thuê xe vào đây...',
    ai_error: 'Không thể phân tích dữ liệu.',
    ai_missing_key: 'Thiếu khóa API.',
    cancel: 'Hủy',
    parse: 'Phân tích',
    analyzing: 'Đang phân tích...',
    step_counter: 'Bước {current} trên {total}',
    btn_back: 'Quay lại',
    btn_next: 'Tiếp theo',
    step_general: 'Thông tin chung',
    step_seller: 'Người bán (Nhà cung cấp)',
    step_buyer: 'Người mua (Khách hàng)',
    step_goods: 'Hàng hóa & Dịch vụ',
    type_person: 'Tự doanh / IP',
    type_company: 'Công ty',
    lbl_invoice_no: 'Hóa đơn #',
    lbl_date: 'Ngày',
    lbl_time: 'Giờ',
    lbl_vat: 'VAT',
    lbl_name_fio: 'Tên / Họ tên',
    lbl_inn: 'Mã số thuế',
    lbl_kpp: 'KPP',
    lbl_address: 'Địa chỉ pháp lý',
    lbl_bank_details: 'CHI TIẾT NGÂN HÀNG',
    lbl_bank_name: 'Tên ngân hàng',
    lbl_bik: 'BIC',
    lbl_corr_account: 'Tài khoản đại lý',
    lbl_account_number: 'Số tài khoản',
    lbl_signatories: 'NGƯỜI KÝ TÊN',
    lbl_director: 'Giám đốc',
    lbl_accountant: 'Kế toán',
    lbl_buyer_name: 'Tên công ty',
    lbl_service_list: 'Danh sách dịch vụ',
    lbl_item_name: 'Tên',
    lbl_qty: 'SL',
    lbl_price: 'Giá (RUB)',
    msg_no_items: 'Không có mục nào',
    step_vehicle: 'Xe & Thông tin',
    step_schedule: 'Lịch trình',
    step_financials: 'Tài chính',
    step_parties: 'Các bên & Điều khoản',
    step_signatures: 'Chữ ký',
    lbl_res_id: 'ID Đặt chỗ',
    lbl_template_id: 'ID Mẫu',
    lbl_optional: 'Tùy chọn',
    lbl_source: 'Nguồn',
    lbl_created: 'Đã tạo',
    grp_vehicle: 'CHI TIẾT XE',
    lbl_model: 'Tên mẫu xe',
    lbl_details: 'Chi tiết (Loại, Màu sắc)',
    lbl_plate: 'Biển số',
    grp_pickup: 'NHẬN XE (BẮT ĐẦU)',
    grp_return: 'TRẢ XE (KẾT THÚC)',
    lbl_reg_days: 'Ngày thường',
    lbl_reg_price: 'Giá thường',
    lbl_seas_days: 'Ngày mùa cao điểm',
    lbl_seas_price: 'Giá mùa cao điểm',
    grp_extra: 'TÙY CHỌN THÊM',
    lbl_deposit: 'Tiền cọc',
    lbl_total_paid: 'TỔNG ĐÃ THANH TOÁN',
    grp_owner: 'CHỦ XE (BÊN CHO THUÊ)',
    lbl_surname: 'Họ / Tên',
    lbl_contact: 'Liên hệ',
    grp_renter: 'NGƯỜI THUÊ (BÊN THUÊ)',
    lbl_passport: 'Số hộ chiếu',
    lbl_terms: 'Điều khoản pháp lý',
    lbl_fee: 'Phí thêm',
    lbl_sign_owner: 'Chữ ký chủ xe',
    lbl_sign_renter: 'Chữ ký người thuê',
    btn_clear: 'Xóa',
    btn_save_sign: 'Lưu chữ ký',
    msg_sign_saved: 'Đã lưu chữ ký',
    lbl_sign_here: 'Ký tại đây',
    login_title: 'Truy cập hạn chế',
    login_desc: 'Vui lòng đăng nhập để xem tài liệu này.',
    lbl_username: 'Tên người dùng / Email',
    lbl_password: 'Mật khẩu',
    btn_login: 'Đăng nhập',
    preview_loading: 'Đang tải tài liệu...',
    preview_not_found: 'Không tìm thấy tài liệu',
    preview_lease_title: 'Xem trước hợp đồng thuê',
    server_preview: 'Xem trước (Máy chủ)',
    generating_blob: 'Đang tạo PDF...',
    mobile_editor_tab: 'Trình chỉnh sửa',
    mobile_preview_tab: 'Xem trước',
    open_shareable_link: 'Mở liên kết chia sẻ',
    lp_lease_agreement: 'Hợp đồng thuê',
    lp_reservation_id: 'ID Đặt chỗ',
    lp_source: 'Nguồn',
    lp_created_on: 'Đã tạo',
    lp_pickup: 'Nhận xe',
    lp_default_pickup: 'Nhận xe mặc định',
    lp_return: 'Trả xe',
    lp_default_return: 'Trả xe mặc định',
    lp_rental_cost: 'Chi phí thuê',
    lp_regular_price: 'Giá thường',
    lp_season_price: 'Giá mùa cao điểm',
    lp_days: 'ngày',
    lp_extra_options: 'Tùy chọn thêm',
    lp_none: 'Không có',
    lp_deposit: 'Tiền cọc',
    lp_return_at_end: 'Hoàn trả khi kết thúc thuê',
    lp_total_price: 'Tổng giá',
    lp_paid_separately: 'Thanh toán riêng',
    lp_owner: 'Chủ xe',
    lp_lessor: 'Bên cho thuê',
    lp_date_signature: 'Ngày, chữ ký',
    lp_rider: 'Người thuê',
    lp_tenant: 'Bên thuê',
    lp_passport: 'Hộ chiếu',
    lp_pickup_fee: 'Phí nhận xe',
    lp_return_fee: 'Phí trả xe',
    chat_search: 'Tìm kiếm trò chuyện',
    chat_type_message: 'Nhập tin nhắn...',
    chat_active: 'Đang hoạt động',
    chat_view_profile: 'Xem hồ sơ',
    chat_search_history: 'Tìm kiếm lịch sử',
    btn_confirm: 'Xác nhận',
    btn_reject: 'Từ chối',
    btn_delete: 'Xóa',
    btn_archive: 'Lưu trữ',
    btn_call: 'Gọi',
    btn_download_lease: 'Tải hợp đồng',
    btn_download_invoice: 'Tải hóa đơn',
    btn_collect: 'Giao xe',
    btn_complete: 'Hoàn thành',
    menu_mark_read: 'Đánh dấu đã đọc',
    menu_mark_unread: 'Đánh dấu chưa đọc',
    confirm_delete_chat: 'Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?',
    no_active_chats: 'Không tìm thấy cuộc trò chuyện nào.',
    loading_chats: 'Đang tải trò chuyện...',
    lbl_sort_by: 'Sắp xếp',
    lbl_filter_status: 'Lọc trạng thái',
    sort_date: 'Ngày',
    sort_name: 'Tên',
    filter_all: 'Tất cả',
    timeline_title: 'Dòng thời gian',
    no_dates: 'Chưa chọn ngày',
    expires_in: 'Hết hạn trong',
    left_to_action: 'còn lại để hành động',
    loading_conversation: 'Đang tải cuộc trò chuyện...',
    select_conversation: 'Chọn một cuộc trò chuyện',
    select_conversation_desc: 'Chọn một cuộc trò chuyện từ thanh bên để xem chi tiết, quản lý hợp đồng thuê và giao tiếp với người thuê.',
    rp_details: 'Chi tiết',
    rp_map: 'Bản đồ',
    rp_profile: 'Hồ sơ',
    rp_pickup_location: 'Địa điểm nhận xe',
    rp_map_placeholder: 'Bản đồ',
    rp_leases: 'Hợp đồng thuê',
    rp_status: 'Trạng thái',
    rp_active: 'Hoạt động',
    rp_rider_details: 'Chi tiết người thuê',
    rp_full_name: 'Họ tên',
    rp_enter_name: 'Nhập tên',
    rp_contact_info: 'Thông tin liên hệ',
    rp_phone_email: 'Điện thoại hoặc Email',
    rp_passport_id: 'Hộ chiếu / CMND',
    rp_passport_number: 'Số hộ chiếu',
    rp_owner_details: 'Chi tiết chủ xe',
    rp_rent_service_name: 'Tên dịch vụ thuê',
    rp_shown_on_contract: 'Hiển thị trên hợp đồng',
    rp_business_address: 'Địa chỉ kinh doanh',
    rp_full_address: 'Địa chỉ đầy đủ',
    status_collected: 'Đã nhận xe',
    status_completed: 'Hoàn thành',
    status_overdue: 'Quá hạn',
    status_confirmed: 'Đã xác nhận',
    status_pending: 'Chờ xử lý',
    status_wait_owner: 'Chờ chủ xe',
    status_wait_rider: 'Chờ người thuê',
    status_rejected: 'Đã từ chối',
    status_maintenance: 'Bảo trì',
    status_cancelled: 'Đã hủy',
    status_conflict: 'Xung đột',
    status_no_response: 'Không phản hồi',
    time_ended: 'Đã kết thúc',
    time_overdue_by: 'Quá hạn',
    time_ending_now: 'Đang kết thúc',
    time_ends_in: 'Kết thúc trong',
    time_days_left: 'ngày còn lại'
  },
  id: {
    invoice_editor: 'Editor Faktur',
    lease_editor: 'Editor Sewa',
    preview: 'Pratinjau',
    download_pdf: 'Unduh PDF',
    download_file: 'Unduh Berkas',
    processing: 'Memproses...',
    reset: 'Atur Ulang',
    ai_import: 'Impor AI',
    switch_invoice: 'Faktur (RU)',
    switch_lease: 'Sewa',
    switch_chat: 'Obrolan',
    doc_invoice: 'A4 PDF • Standar Rusia',
    doc_lease: 'A4 PDF • Perjanjian Sewa',
    ai_modal_title: 'Impor Data AI',
    ai_placeholder: 'Tempel teks faktur atau detail sewa di sini...',
    ai_error: 'Tidak dapat mengurai data.',
    ai_missing_key: 'Kunci API hilang.',
    cancel: 'Batal',
    parse: 'Urai',
    analyzing: 'Menganalisis...',
    step_counter: 'Langkah {current} dari {total}',
    btn_back: 'Kembali',
    btn_next: 'Lanjut',
    step_general: 'Info Umum',
    step_seller: 'Penjual (Penyedia)',
    step_buyer: 'Pembeli (Pelanggan)',
    step_goods: 'Barang & Layanan',
    type_person: 'Wiraswasta / IP',
    type_company: 'Perusahaan',
    lbl_invoice_no: 'No. Faktur',
    lbl_date: 'Tanggal',
    lbl_time: 'Waktu',
    lbl_vat: 'PPN',
    lbl_name_fio: 'Nama / Nama Lengkap',
    lbl_inn: 'NPWP',
    lbl_kpp: 'KPP',
    lbl_address: 'Alamat Hukum',
    lbl_bank_details: 'DETAIL BANK',
    lbl_bank_name: 'Nama Bank',
    lbl_bik: 'BIC',
    lbl_corr_account: 'Akun Koresponden',
    lbl_account_number: 'Nomor Rekening',
    lbl_signatories: 'PENANDATANGAN',
    lbl_director: 'Direktur',
    lbl_accountant: 'Akuntan',
    lbl_buyer_name: 'Nama Perusahaan',
    lbl_service_list: 'Daftar Layanan',
    lbl_item_name: 'Nama',
    lbl_qty: 'Jml',
    lbl_price: 'Harga (RUB)',
    msg_no_items: 'Tidak ada barang',
    step_vehicle: 'Kendaraan & Info',
    step_schedule: 'Jadwal',
    step_financials: 'Keuangan',
    step_parties: 'Pihak & Ketentuan',
    step_signatures: 'Tanda Tangan',
    lbl_res_id: 'ID Reservasi',
    lbl_template_id: 'ID Templat',
    lbl_optional: 'Opsional',
    lbl_source: 'Sumber',
    lbl_created: 'Dibuat Pada',
    grp_vehicle: 'DETAIL KENDARAAN',
    lbl_model: 'Nama Model',
    lbl_details: 'Detail (Tipe, Warna)',
    lbl_plate: 'Nomor Plat',
    grp_pickup: 'PENGAMBILAN (MULAI)',
    grp_return: 'PENGEMBALIAN (SELESAI)',
    lbl_reg_days: 'Hari Reguler',
    lbl_reg_price: 'Harga Reguler',
    lbl_seas_days: 'Hari Musim',
    lbl_seas_price: 'Harga Musim',
    grp_extra: 'OPSI TAMBAHAN',
    lbl_deposit: 'Jumlah Deposit',
    lbl_total_paid: 'TOTAL DIBAYAR',
    grp_owner: 'PEMILIK (PENYEWA)',
    lbl_surname: 'Nama Belakang / Nama',
    lbl_contact: 'Kontak',
    grp_renter: 'PENGENDARA (PENYEWA)',
    lbl_passport: 'No Paspor',
    lbl_terms: 'Ketentuan Hukum',
    lbl_fee: 'Biaya Tambahan',
    lbl_sign_owner: 'Tanda Tangan Pemilik',
    lbl_sign_renter: 'Tanda Tangan Pengendara',
    btn_clear: 'Hapus',
    btn_save_sign: 'Simpan Tanda Tangan',
    msg_sign_saved: 'Tanda Tangan Disimpan',
    lbl_sign_here: 'Tanda Tangan di Sini',
    login_title: 'Akses Terbatas',
    login_desc: 'Silakan masuk untuk melihat dokumen ini.',
    lbl_username: 'Nama Pengguna / Email',
    lbl_password: 'Kata Sandi',
    btn_login: 'Masuk',
    preview_loading: 'Memuat Dokumen...',
    preview_not_found: 'Dokumen tidak ditemukan',
    preview_lease_title: 'Pratinjau Perjanjian Sewa',
    server_preview: 'Pratinjau Server',
    generating_blob: 'Membuat PDF...',
    mobile_editor_tab: 'Editor',
    mobile_preview_tab: 'Pratinjau',
    open_shareable_link: 'Buka Tautan yang Dapat Dibagikan',
    lp_lease_agreement: 'Perjanjian sewa',
    lp_reservation_id: 'ID Reservasi',
    lp_source: 'Sumber',
    lp_created_on: 'Dibuat pada',
    lp_pickup: 'Pengambilan',
    lp_default_pickup: 'Pengambilan standar',
    lp_return: 'Pengembalian',
    lp_default_return: 'Pengembalian standar',
    lp_rental_cost: 'Biaya Sewa',
    lp_regular_price: 'Harga reguler',
    lp_season_price: 'Harga musim',
    lp_days: 'hari',
    lp_extra_options: 'Opsi tambahan',
    lp_none: 'Tidak ada',
    lp_deposit: 'Deposit',
    lp_return_at_end: 'Kembali pada akhir masa sewa',
    lp_total_price: 'Total harga',
    lp_paid_separately: 'Dibayar terpisah',
    lp_owner: 'Pemilik',
    lp_lessor: 'Penyewa',
    lp_date_signature: 'Tanggal, tanda tangan',
    lp_rider: 'Pengendara',
    lp_tenant: 'Penyewa',
    lp_passport: 'Paspor',
    lp_pickup_fee: 'Biaya pengambilan',
    lp_return_fee: 'Biaya pengembalian',
    chat_search: 'Cari obrolan',
    chat_type_message: 'Ketik pesan...',
    chat_active: 'Aktif sekarang',
    chat_view_profile: 'Lihat profil',
    chat_search_history: 'Cari riwayat',
    btn_confirm: 'Konfirmasi',
    btn_reject: 'Tolak',
    btn_delete: 'Hapus',
    btn_archive: 'Arsipkan',
    btn_call: 'Panggil',
    btn_download_lease: 'Unduh Sewa',
    btn_download_invoice: 'Unduh Faktur',
    btn_collect: 'Serahkan',
    btn_complete: 'Selesai',
    menu_mark_read: 'Tandai sudah dibaca',
    menu_mark_unread: 'Tandai belum dibaca',
    confirm_delete_chat: 'Apakah Anda yakin ingin menghapus percakapan ini?',
    no_active_chats: 'Tidak ada obrolan aktif ditemukan.',
    loading_chats: 'Memuat obrolan...',
    lbl_sort_by: 'Urutkan',
    lbl_filter_status: 'Filter Status',
    sort_date: 'Tanggal',
    sort_name: 'Nama',
    filter_all: 'Semua',
    timeline_title: 'Linimasa',
    no_dates: 'Tidak ada tanggal diatur',
    expires_in: 'Berakhir dalam',
    left_to_action: 'tersisa untuk tindakan',
    loading_conversation: 'Memuat percakapan...',
    select_conversation: 'Pilih Percakapan',
    select_conversation_desc: 'Pilih obrolan dari bilah samping untuk melihat detail, mengelola perjanjian sewa, dan berkomunikasi dengan penyewa.',
    rp_details: 'Detail',
    rp_map: 'Peta',
    rp_profile: 'Profil',
    rp_pickup_location: 'Lokasi Pengambilan',
    rp_map_placeholder: 'Peta',
    rp_leases: 'Sewa',
    rp_status: 'Status',
    rp_active: 'Aktif',
    rp_rider_details: 'Detail Pengendara',
    rp_full_name: 'Nama Lengkap',
    rp_enter_name: 'Masukkan Nama',
    rp_contact_info: 'Info Kontak',
    rp_phone_email: 'Telepon atau Email',
    rp_passport_id: 'Paspor / ID',
    rp_passport_number: 'Nomor Paspor',
    rp_owner_details: 'Detail Pemilik',
    rp_rent_service_name: 'Nama Layanan Sewa',
    rp_shown_on_contract: 'Ditampilkan di kontrak',
    rp_business_address: 'Alamat Bisnis',
    rp_full_address: 'Alamat Lengkap',
    status_collected: 'Diambil',
    status_completed: 'Selesai',
    status_overdue: 'Terlambat',
    status_confirmed: 'Dikonfirmasi',
    status_pending: 'Menunggu',
    status_wait_owner: 'Tunggu Pemilik',
    status_wait_rider: 'Tunggu Pengendara',
    status_rejected: 'Ditolak',
    status_maintenance: 'Pemeliharaan',
    status_cancelled: 'Dibatalkan',
    status_conflict: 'Konflik',
    status_no_response: 'Tidak Ada Respon',
    time_ended: 'Berakhir',
    time_overdue_by: 'Terlambat selama',
    time_ending_now: 'Berakhir sekarang',
    time_ends_in: 'Berakhir dalam',
    time_days_left: 'hari tersisa'
  }
};

export const t = (key: TranslationKey, lang: Language): string => {
  return dictionary[lang][key] || key;
};
