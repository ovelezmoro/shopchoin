<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title>Inicio de sesión - ShopChain</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<style>
    body {
        background: #f5f7fb;
        color: #343a40;
        font-family: Arial, Helvetica, sans-serif;
    }
    .app-shell {
        min-height: 100vh;
    }
    .sidebar {
        width: 230px;
        min-height: 100vh;
        background: #ffffff;
        border-right: 1px solid #e9ecef;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1000;
    }
    .sidebar-brand {
        padding: 22px 20px;
        font-size: 1.35rem;
        font-weight: 700;
        border-bottom: 1px solid #eef0f3;
    }
    .sidebar .nav-link {
        color: #495057;
        border-radius: 6px;
        margin: 4px 10px;
        padding: 10px 12px;
    }
    .sidebar .nav-link.active,
    .sidebar .nav-link:hover {
        background: #eaf2ff;
        color: #0d6efd;
    }
    .main {
        margin-left: 230px;
        min-height: 100vh;
    }
    .topbar {
        height: 68px;
        background: #ffffff;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
    }
    .content {
        padding: 28px;
    }
    .card-soft {
        border: 0;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,.04);
    }
    .metric-card {
        border: 0;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,.04);
    }
    .metric-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #eaf2ff;
        color: #0d6efd;
    }
    .badge-soft-success {
        background: #e6f4ea;
        color: #2e7d32;
    }
    .badge-soft-warning {
        background: #fff4db;
        color: #9a6700;
    }
    .badge-soft-danger {
        background: #fde8e8;
        color: #b42318;
    }
    .badge-soft-info {
        background: #e6f3ff;
        color: #1565c0;
    }
    .table thead th {
        border-top: 0;
        color: #6c757d;
        font-weight: 600;
        font-size: .85rem;
    }
    .product-thumb {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        background: linear-gradient(135deg, #eef2f7, #dfe6ee);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 1.3rem;
    }
    .shoe-hero {
        min-height: 320px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f1f3f5, #dfe6ee);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size: 5rem;
        color:#6c757d;
    }
    .section-title {
        font-size: 1.6rem;
        font-weight: 700;
        margin-bottom: 4px;
    }
    .section-subtitle {
        color: #6c757d;
        margin-bottom: 22px;
    }
    .fake-chart {
        height: 220px;
        display:flex;
        align-items:flex-end;
        gap:16px;
        padding:20px;
        border-top:1px solid #f0f0f0;
    }
    .bar {
        flex:1;
        background:#cfe2ff;
        border-radius:6px 6px 0 0;
        min-width:24px;
    }
    .timeline-step {
        position: relative;
        padding-left: 34px;
        margin-bottom: 26px;
    }
    .timeline-step:before {
        content:'';
        position:absolute;
        left:8px;
        top:8px;
        width:14px;
        height:14px;
        border-radius:50%;
        background:#0d6efd;
    }
    .timeline-step:after {
        content:'';
        position:absolute;
        left:14px;
        top:22px;
        width:2px;
        height:36px;
        background:#dee2e6;
    }
    .timeline-step:last-child:after {
        display:none;
    }
    .form-control[readonly] {
        background-color:#fff;
    }
    @media (max-width: 991px) {
        .sidebar {
            position: static;
            width: 100%;
            min-height: auto;
        }
        .main {
            margin-left: 0;
        }
    }
</style>
<style>
.login-page {
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    background:linear-gradient(135deg,#f7f9fc,#edf2f7);
}
.login-card {
    width:100%;
    max-width:430px;
    border:0;
    border-radius:16px;
    box-shadow:0 10px 35px rgba(0,0,0,.08);
}
.brand-icon {
    width:64px;height:64px;border-radius:16px;background:#eaf2ff;color:#0d6efd;
    display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.7rem;
}
</style>
</head>
<body>
<div class="login-page px-3">
  <div class="card login-card">
    <div class="card-body p-5">
      <div class="brand-icon"><i class="fas fa-boxes"></i></div>
      <h3 class="text-center font-weight-bold mb-2">ShopChain</h3>
      <p class="text-center text-muted mb-4">Gestión de inventarios y logística</p>
      <% if (request.getAttribute("error") != null) { %>
      <div class="alert alert-danger" role="alert"><%= request.getAttribute("error") %></div>
      <% } %>
      <form method="post" action="${pageContext.request.contextPath}/login">
      <div class="form-group">
        <label>Correo electrónico</label>
        <input class="form-control form-control-lg" name="email" placeholder="usuario@shopchain.pe">
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input class="form-control form-control-lg" name="password" type="password" value="12345678">
      </div>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" checked disabled>
          <label class="form-check-label">Recordarme</label>
        </div>
        <span class="text-primary small">¿Olvidaste tu contraseña?</span>
      </div>
      <button type="submit" class="btn btn-primary btn-lg btn-block">Ingresar</button>
      </form>
    </div>
  </div>
</div>
</body>
</html>
